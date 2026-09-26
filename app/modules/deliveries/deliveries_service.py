from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import DeliveryOrder, DocumentStatus
from app.models.ledger import MovementType
from app.modules.deliveries.deliveries_repository import DeliveryRepository
from app.modules.deliveries.deliveries_schemas import DeliveryCreate, DeliveryUpdate
from app.modules.ledger.ledger_service import apply_stock_movement
from app.core.exceptions import ResourceNotFoundError, InvalidStateTransitionError, InsufficientStockError, AppException

class DeliveryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DeliveryRepository(db)

    async def create_delivery(self, data: DeliveryCreate, user_id: int) -> DeliveryOrder:
        if not data.items:
            raise AppException("Delivery items list cannot be empty", status_code=422)

        product_ids = [item.product_id for item in data.items]
        if not await self.repo.check_products_exist(product_ids):
            raise ResourceNotFoundError("Product", product_ids)

        location_ids = [item.location_id for item in data.items]
        if not await self.repo.check_locations_exist(location_ids):
            raise ResourceNotFoundError("Location", location_ids)

        return await self.repo.create(data, user_id)

    async def get_delivery(self, delivery_id: int) -> DeliveryOrder:
        delivery = await self.repo.get_by_id(delivery_id)
        if not delivery:
            raise ResourceNotFoundError("DeliveryOrder", delivery_id)
        return delivery

    async def list_deliveries(
        self,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[DeliveryOrder], int]:
        return await self.repo.list_deliveries(
            status=status,
            warehouse_id=warehouse_id,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

    async def update_delivery(self, delivery_id: int, data: DeliveryUpdate) -> DeliveryOrder:
        delivery = await self.get_delivery(delivery_id)
        if delivery.status in (DocumentStatus.done, DocumentStatus.canceled):
            raise InvalidStateTransitionError(f"Delivery order is already {delivery.status.value} and cannot be edited")

        if data.items is not None:
            if not data.items:
                raise AppException("Delivery items list cannot be empty", status_code=422)

            product_ids = [item.product_id for item in data.items]
            if not await self.repo.check_products_exist(product_ids):
                raise ResourceNotFoundError("Product", product_ids)

            location_ids = [item.location_id for item in data.items]
            if not await self.repo.check_locations_exist(location_ids):
                raise ResourceNotFoundError("Location", location_ids)

        return await self.repo.update(delivery, data)

    async def validate_delivery(self, delivery_id: int) -> DeliveryOrder:
        delivery = await self.get_delivery(delivery_id)
        if delivery.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Delivery order is already validated and done")
        if delivery.status == DocumentStatus.canceled:
            raise InvalidStateTransitionError("Canceled delivery order cannot be validated")

        # 1. Pre-validation sufficiency check for all items
        insufficient_items = await self.repo.get_insufficient_items(delivery.items)
        if insufficient_items:
            raise InsufficientStockError(
                items=insufficient_items,
                message="Insufficient stock for one or more items"
            )

        # 2. Apply stock movement with negative quantity for each item inside ONE transaction
        for item in delivery.items:
            await apply_stock_movement(
                db=self.db,
                product_id=item.product_id,
                location_id=item.location_id,
                change_qty=-item.quantity,
                movement_type=MovementType.delivery,
                reference_table="delivery_orders",
                reference_id=delivery.id,
            )

        delivery.status = DocumentStatus.done
        delivery.validated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return await self.get_delivery(delivery.id)

    async def cancel_delivery(self, delivery_id: int) -> DeliveryOrder:
        delivery = await self.get_delivery(delivery_id)
        if delivery.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Validated delivery order cannot be canceled")
        if delivery.status == DocumentStatus.canceled:
            return delivery

        delivery.status = DocumentStatus.canceled
        await self.db.commit()
        return await self.get_delivery(delivery.id)
