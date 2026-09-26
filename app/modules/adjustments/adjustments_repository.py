from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Product, Location
from app.models.documents import StockAdjustment
from app.models.stock import StockLevel

class AdjustmentRepository:
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

    async def get_current_system_qty(self, product_id: int, location_id: int) -> Decimal:
        stmt = select(StockLevel.quantity).where(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none() or Decimal("0")

    async def create(
        self,
        product_id: int,
        location_id: int,
        system_qty: Decimal,
        counted_qty: Decimal,
        difference: Decimal,
        reason: Optional[str],
        user_id: int,
    ) -> StockAdjustment:
        adjustment = StockAdjustment(
            product_id=product_id,
            location_id=location_id,
            system_qty=system_qty,
            counted_qty=counted_qty,
            difference=difference,
            reason=reason,
            created_by=user_id,
        )
        self.db.add(adjustment)
        await self.db.flush()
        return adjustment

    async def get_by_id(self, adjustment_id: int) -> Optional[StockAdjustment]:
        stmt = select(StockAdjustment).where(StockAdjustment.id == adjustment_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_adjustments(
        self,
        product_id: Optional[int] = None,
        location_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[StockAdjustment], int]:
        conditions = []
        if product_id:
            conditions.append(StockAdjustment.product_id == product_id)
        if location_id:
            conditions.append(StockAdjustment.location_id == location_id)
        if date_from:
            conditions.append(StockAdjustment.created_at >= date_from)
        if date_to:
            conditions.append(StockAdjustment.created_at <= date_to)

        count_stmt = select(func.count(StockAdjustment.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await self.db.execute(count_stmt)
        total_count = total_res.scalar_one()

        query = (
            select(StockAdjustment)
            .order_by(StockAdjustment.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        res = await self.db.execute(query)
        adjustments = res.scalars().all()
        return adjustments, total_count
