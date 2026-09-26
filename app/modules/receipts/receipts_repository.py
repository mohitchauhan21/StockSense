from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import Receipt, ReceiptItem, DocumentStatus
from app.models import Product, Location
from app.modules.receipts.receipts_schemas import ReceiptCreate, ReceiptUpdate

class ReceiptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_products_exist(self, product_ids: List[int]) -> bool:
        stmt = select(func.count(Product.id)).where(Product.id.in_(product_ids), Product.is_active == True)
        res = await self.db.execute(stmt)
        count = res.scalar_one()
        return count == len(set(product_ids))

    async def check_locations_exist(self, location_ids: List[int]) -> bool:
        stmt = select(func.count(Location.id)).where(Location.id.in_(location_ids))
        res = await self.db.execute(stmt)
        count = res.scalar_one()
        return count == len(set(location_ids))

    async def create(self, data: ReceiptCreate, user_id: int) -> Receipt:
        receipt = Receipt(
            supplier_name=data.supplier_name,
            status=DocumentStatus.draft,
            created_by=user_id,
        )
        self.db.add(receipt)
        await self.db.flush()

        for item_in in data.items:
            item = ReceiptItem(
                receipt_id=receipt.id,
                product_id=item_in.product_id,
                location_id=item_in.location_id,
                quantity=item_in.quantity,
            )
            self.db.add(item)
        
        await self.db.commit()
        return await self.get_by_id(receipt.id)

    async def get_by_id(self, receipt_id: int) -> Optional[Receipt]:
        stmt = (
            select(Receipt)
            .options(selectinload(Receipt.items))
            .where(Receipt.id == receipt_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_receipts(
        self,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Receipt], int]:
        conditions = []
        if status:
            conditions.append(Receipt.status == status)
        if date_from:
            conditions.append(Receipt.created_at >= date_from)
        if date_to:
            conditions.append(Receipt.created_at <= date_to)
        if warehouse_id:
            conditions.append(
                Receipt.id.in_(
                    select(ReceiptItem.receipt_id)
                    .join(Location, ReceiptItem.location_id == Location.id)
                    .where(Location.warehouse_id == warehouse_id)
                )
            )

        count_stmt = select(func.count(Receipt.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await self.db.execute(count_stmt)
        total_count = total_res.scalar_one()

        query = (
            select(Receipt)
            .options(selectinload(Receipt.items))
            .order_by(Receipt.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        res = await self.db.execute(query)
        receipts = res.scalars().all()
        return receipts, total_count

    async def update(self, receipt: Receipt, data: ReceiptUpdate) -> Receipt:
        if data.supplier_name is not None:
            receipt.supplier_name = data.supplier_name
        
        if data.items is not None:
            # delete existing items
            for item in list(receipt.items):
                await self.db.delete(item)
            await self.db.flush()

            for item_in in data.items:
                item = ReceiptItem(
                    receipt_id=receipt.id,
                    product_id=item_in.product_id,
                    location_id=item_in.location_id,
                    quantity=item_in.quantity,
                )
                self.db.add(item)

        await self.db.commit()
        return await self.get_by_id(receipt.id)
