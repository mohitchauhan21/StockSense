from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import StockAdjustment
from app.models.ledger import MovementType
from app.modules.adjustments.adjustments_repository import AdjustmentRepository
from app.modules.adjustments.adjustments_schemas import AdjustmentCreate
from app.modules.ledger.ledger_service import apply_stock_movement
from app.core.exceptions import ResourceNotFoundError

class AdjustmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AdjustmentRepository(db)

    async def create_adjustment(self, data: AdjustmentCreate, user_id: int) -> StockAdjustment:
        if not await self.repo.check_product_exists(data.product_id):
            raise ResourceNotFoundError("Product", data.product_id)

        if not await self.repo.check_location_exists(data.location_id):
            raise ResourceNotFoundError("Location", data.location_id)

        # 1. Snapshot current system_qty
        system_qty = await self.repo.get_current_system_qty(data.product_id, data.location_id)
        difference = data.counted_qty - system_qty

        # 2. Record adjustment document
        adjustment = await self.repo.create(
            product_id=data.product_id,
            location_id=data.location_id,
            system_qty=system_qty,
            counted_qty=data.counted_qty,
            difference=difference,
            reason=data.reason,
            user_id=user_id,
        )

        # 3. Apply stock movement choke-point call
        await apply_stock_movement(
            db=self.db,
            product_id=data.product_id,
            location_id=data.location_id,
            change_qty=difference,
            movement_type=MovementType.adjustment,
            reference_table="stock_adjustments",
            reference_id=adjustment.id,
        )

        await self.db.commit()
        return await self.get_adjustment(adjustment.id)

    async def get_adjustment(self, adjustment_id: int) -> StockAdjustment:
        adj = await self.repo.get_by_id(adjustment_id)
        if not adj:
            raise ResourceNotFoundError("StockAdjustment", adjustment_id)
        return adj

    async def list_adjustments(
        self,
        product_id: Optional[int] = None,
        location_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[StockAdjustment], int]:
        return await self.repo.list_adjustments(
            product_id=product_id,
            location_id=location_id,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )
