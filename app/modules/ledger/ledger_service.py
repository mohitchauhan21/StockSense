from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stock import StockLevel
from app.models.ledger import StockLedger, MovementType
from app.core.exceptions import InsufficientStockError
from app.modules.ledger.ledger_repository import LedgerRepository
from app.modules.ledger.ledger_schemas import LocationBalanceCheck, ProductBalanceCheckOut

async def apply_stock_movement(
    db: AsyncSession,
    product_id: int,
    location_id: int,
    change_qty: Decimal,
    movement_type: MovementType,
    reference_table: str,
    reference_id: int,
) -> StockLedger:
    stmt = (
        select(StockLevel)
        .where(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
        .with_for_update()
    )
    result = await db.execute(stmt)
    stock_row = result.scalar_one_or_none()

    current_qty = stock_row.quantity if stock_row else Decimal("0")
    new_qty = current_qty + change_qty

    if new_qty < Decimal("0"):
        raise InsufficientStockError(
            product_id=product_id,
            location_id=location_id,
            requested=float(abs(change_qty)),
            available=float(current_qty),
        )

    if stock_row is None:
        stock_row = StockLevel(
            product_id=product_id, location_id=location_id, quantity=new_qty
        )
        db.add(stock_row)
    else:
        stock_row.quantity = new_qty

    ledger_entry = StockLedger(
        product_id=product_id,
        location_id=location_id,
        change_qty=change_qty,
        balance_after=new_qty,
        movement_type=movement_type,
        reference_table=reference_table,
        reference_id=reference_id,
    )
    db.add(ledger_entry)
    await db.flush()
    return ledger_entry

class LedgerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = LedgerRepository(db)

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
        return await self.repo.list_ledger(
            product_id=product_id,
            location_id=location_id,
            movement_type=movement_type,
            reference_table=reference_table,
            reference_id=reference_id,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

    async def get_product_balance_check(self, product_id: int) -> ProductBalanceCheckOut:
        stock_map = await self.repo.get_stock_levels_by_product(product_id)
        ledger_map = await self.repo.get_ledger_sums_by_product(product_id)

        all_locations = sorted(list(set(stock_map.keys()).union(set(ledger_map.keys()))))
        loc_checks = []
        overall_consistent = True

        for loc_id in all_locations:
            stock_qty = stock_map.get(loc_id, Decimal("0"))
            ledger_qty = ledger_map.get(loc_id, Decimal("0"))
            is_consistent = (stock_qty == ledger_qty)
            if not is_consistent:
                overall_consistent = False

            loc_checks.append(
                LocationBalanceCheck(
                    location_id=loc_id,
                    stock_level_qty=float(stock_qty),
                    ledger_sum_qty=float(ledger_qty),
                    is_consistent=is_consistent,
                )
            )

        return ProductBalanceCheckOut(
            product_id=product_id,
            locations=loc_checks,
            overall_consistent=overall_consistent,
        )
