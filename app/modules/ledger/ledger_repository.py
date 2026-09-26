from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple, Dict
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import StockLedger, MovementType
from app.models.stock import StockLevel

class LedgerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_ledger(
        self,
        product_id: Optional[int] = None,
        location_id: Optional[int] = None,
        movement_type: Optional[MovementType] = None,
        reference_table: Optional[str] = None,
        reference_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[StockLedger], int]:
        conditions = []
        if product_id:
            conditions.append(StockLedger.product_id == product_id)
        if location_id:
            conditions.append(StockLedger.location_id == location_id)
        if movement_type:
            conditions.append(StockLedger.movement_type == movement_type)
        if reference_table:
            conditions.append(StockLedger.reference_table == reference_table)
        if reference_id:
            conditions.append(StockLedger.reference_id == reference_id)
        if date_from:
            conditions.append(StockLedger.created_at >= date_from)
        if date_to:
            conditions.append(StockLedger.created_at <= date_to)

        count_stmt = select(func.count(StockLedger.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await self.db.execute(count_stmt)
        total_count = total_res.scalar_one()

        query = (
            select(StockLedger)
            .order_by(StockLedger.created_at.desc(), StockLedger.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        res = await self.db.execute(query)
        rows = res.scalars().all()
        return rows, total_count

    async def get_stock_levels_by_product(self, product_id: int) -> Dict[int, Decimal]:
        stmt = select(StockLevel.location_id, StockLevel.quantity).where(StockLevel.product_id == product_id)
        res = await self.db.execute(stmt)
        return {location_id: qty for location_id, qty in res.all()}

    async def get_ledger_sums_by_product(self, product_id: int) -> Dict[int, Decimal]:
        stmt = (
            select(StockLedger.location_id, func.coalesce(func.sum(StockLedger.change_qty), Decimal("0")))
            .where(StockLedger.product_id == product_id)
            .group_by(StockLedger.location_id)
        )
        res = await self.db.execute(stmt)
        return {location_id: qty for location_id, qty in res.all()}
