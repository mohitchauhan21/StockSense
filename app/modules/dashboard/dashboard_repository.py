from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple, Dict
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Product, StockLevel, Location
from app.models.documents import Receipt, ReceiptItem, DeliveryOrder, DeliveryItem, InternalTransfer, StockAdjustment, DocumentStatus
from app.modules.dashboard.dashboard_schemas import DashboardSummaryOut, UnifiedDocumentOut

class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary_kpis(self) -> DashboardSummaryOut:
        # Group stock levels by active product
        stmt = (
            select(Product.id, Product.reorder_point, func.coalesce(func.sum(StockLevel.quantity), Decimal("0")))
            .outerjoin(StockLevel, Product.id == StockLevel.product_id)
            .where(Product.is_active == True)
            .group_by(Product.id, Product.reorder_point)
        )
        res = await self.db.execute(stmt)
        rows = res.all()

        total_in_stock = 0
        low_stock = 0
        out_of_stock = 0

        for pid, reorder_pt, total_qty in rows:
            if total_qty > Decimal("0"):
                total_in_stock += 1
                if total_qty <= reorder_pt:
                    low_stock += 1
            else:
                out_of_stock += 1

        pending_statuses = [DocumentStatus.draft, DocumentStatus.waiting, DocumentStatus.ready]

        # Pending Receipts
        rec_stmt = select(func.count(Receipt.id)).where(Receipt.status.in_(pending_statuses))
        rec_count = (await self.db.execute(rec_stmt)).scalar_one()

        # Pending Deliveries
        del_stmt = select(func.count(DeliveryOrder.id)).where(DeliveryOrder.status.in_(pending_statuses))
        del_count = (await self.db.execute(del_stmt)).scalar_one()

        # Scheduled Transfers
        tr_stmt = select(func.count(InternalTransfer.id)).where(InternalTransfer.status.in_(pending_statuses))
        tr_count = (await self.db.execute(tr_stmt)).scalar_one()

        return DashboardSummaryOut(
            total_products_in_stock=total_in_stock,
            low_stock_count=low_stock,
            out_of_stock_count=out_of_stock,
            pending_receipts=rec_count,
            pending_deliveries=del_count,
            scheduled_transfers=tr_count,
        )

    async def get_unified_documents(
        self,
        document_type: Optional[str] = None,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        category_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[UnifiedDocumentOut], int]:
        docs: List[UnifiedDocumentOut] = []

        # 1. Receipts
        if document_type is None or document_type == "receipt":
            r_conds = []
            if status:
                r_conds.append(Receipt.status == status)
            if warehouse_id:
                r_conds.append(
                    Receipt.id.in_(
                        select(ReceiptItem.receipt_id)
                        .join(Location, ReceiptItem.location_id == Location.id)
                        .where(Location.warehouse_id == warehouse_id)
                    )
                )
            if category_id:
                r_conds.append(
                    Receipt.id.in_(
                        select(ReceiptItem.receipt_id)
                        .join(Product, ReceiptItem.product_id == Product.id)
                        .where(Product.category_id == category_id)
                    )
                )
            stmt = select(Receipt).order_by(Receipt.created_at.desc())
            if r_conds:
                stmt = stmt.where(and_(*r_conds))
            r_rows = (await self.db.execute(stmt)).scalars().all()
            for r in r_rows:
                docs.append(
                    UnifiedDocumentOut(
                        id=r.id,
                        document_type="receipt",
                        reference=f"Receipt #{r.id}",
                        status=r.status,
                        created_at=r.created_at,
                        detail=r.supplier_name,
                    )
                )

        # 2. Deliveries
        if document_type is None or document_type == "delivery":
            d_conds = []
            if status:
                d_conds.append(DeliveryOrder.status == status)
            if warehouse_id:
                d_conds.append(
                    DeliveryOrder.id.in_(
                        select(DeliveryItem.delivery_order_id)
                        .join(Location, DeliveryItem.location_id == Location.id)
                        .where(Location.warehouse_id == warehouse_id)
                    )
                )
            if category_id:
                d_conds.append(
                    DeliveryOrder.id.in_(
                        select(DeliveryItem.delivery_order_id)
                        .join(Product, DeliveryItem.product_id == Product.id)
                        .where(Product.category_id == category_id)
                    )
                )
            stmt = select(DeliveryOrder).order_by(DeliveryOrder.created_at.desc())
            if d_conds:
                stmt = stmt.where(and_(*d_conds))
            d_rows = (await self.db.execute(stmt)).scalars().all()
            for d in d_rows:
                docs.append(
                    UnifiedDocumentOut(
                        id=d.id,
                        document_type="delivery",
                        reference=f"Delivery #{d.id}",
                        status=d.status,
                        created_at=d.created_at,
                        detail=d.customer_name,
                    )
                )

        # 3. Internal Transfers
        if document_type is None or document_type == "internal":
            t_conds = []
            if status:
                t_conds.append(InternalTransfer.status == status)
            if warehouse_id:
                t_conds.append(
                    or_(
                        InternalTransfer.from_location_id.in_(select(Location.id).where(Location.warehouse_id == warehouse_id)),
                        InternalTransfer.to_location_id.in_(select(Location.id).where(Location.warehouse_id == warehouse_id)),
                    )
                )
            if category_id:
                t_conds.append(
                    InternalTransfer.product_id.in_(select(Product.id).where(Product.category_id == category_id))
                )
            stmt = select(InternalTransfer).order_by(InternalTransfer.created_at.desc())
            if t_conds:
                stmt = stmt.where(and_(*t_conds))
            t_rows = (await self.db.execute(stmt)).scalars().all()
            for t in t_rows:
                docs.append(
                    UnifiedDocumentOut(
                        id=t.id,
                        document_type="internal",
                        reference=f"Transfer #{t.id}",
                        status=t.status,
                        created_at=t.created_at,
                        detail=f"Product {t.product_id}",
                    )
                )

        # 4. Stock Adjustments
        if document_type is None or document_type == "adjustment":
            a_conds = []
            if status is None or status == DocumentStatus.done:  # Adjustments are created as done
                if warehouse_id:
                    a_conds.append(
                        StockAdjustment.location_id.in_(select(Location.id).where(Location.warehouse_id == warehouse_id))
                    )
                if category_id:
                    a_conds.append(
                        StockAdjustment.product_id.in_(select(Product.id).where(Product.category_id == category_id))
                    )
                stmt = select(StockAdjustment).order_by(StockAdjustment.created_at.desc())
                if a_conds:
                    stmt = stmt.where(and_(*a_conds))
                a_rows = (await self.db.execute(stmt)).scalars().all()
                for a in a_rows:
                    docs.append(
                        UnifiedDocumentOut(
                            id=a.id,
                            document_type="adjustment",
                            reference=f"Adjustment #{a.id}",
                            status=DocumentStatus.done,
                            created_at=a.created_at,
                            detail=a.reason or "Inventory count",
                        )
                    )

        # Sort combined documents by created_at desc
        docs.sort(key=lambda x: x.created_at, reverse=True)
        total_count = len(docs)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_docs = docs[start_idx:end_idx]

        return paginated_docs, total_count
