from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Product, Location
from app.models.documents import InternalTransfer, DocumentStatus
from app.models.stock import StockLevel
from app.modules.transfers.transfers_schemas import TransferCreate

class TransferRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_product_exists(self, product_id: int) -> bool:
        stmt = select(Product.id).where(Product.id == product_id, Product.is_active == True)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none() is not None

    async def check_location_exists(self, location_id: int) -> bool:
        stmt = select(Location.id).where(Location.id == location_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none() is not None

    async def create(self, data: TransferCreate, user_id: int) -> InternalTransfer:
        transfer = InternalTransfer(
            product_id=data.product_id,
            from_location_id=data.from_location_id,
            to_location_id=data.to_location_id,
            quantity=data.quantity,
            status=DocumentStatus.draft,
            created_by=user_id,
        )
        self.db.add(transfer)
        await self.db.commit()
        return await self.get_by_id(transfer.id)

    async def get_by_id(self, transfer_id: int) -> Optional[InternalTransfer]:
        stmt = select(InternalTransfer).where(InternalTransfer.id == transfer_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_source_stock_quantity(self, product_id: int, location_id: int) -> Decimal:
        stmt = select(StockLevel.quantity).where(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none() or Decimal("0")

    async def list_transfers(
        self,
        status: Optional[DocumentStatus] = None,
        product_id: Optional[int] = None,
        from_location_id: Optional[int] = None,
        to_location_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[InternalTransfer], int]:
        conditions = []
        if status:
            conditions.append(InternalTransfer.status == status)
        if product_id:
            conditions.append(InternalTransfer.product_id == product_id)
        if from_location_id:
            conditions.append(InternalTransfer.from_location_id == from_location_id)
        if to_location_id:
            conditions.append(InternalTransfer.to_location_id == to_location_id)

        count_stmt = select(func.count(InternalTransfer.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await self.db.execute(count_stmt)
        total_count = total_res.scalar_one()

        query = (
            select(InternalTransfer)
            .order_by(InternalTransfer.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        res = await self.db.execute(query)
        transfers = res.scalars().all()
        return transfers, total_count
