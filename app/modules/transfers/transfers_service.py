from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import InternalTransfer, DocumentStatus
from app.models.ledger import MovementType
from app.modules.transfers.transfers_repository import TransferRepository
from app.modules.transfers.transfers_schemas import TransferCreate
from app.modules.ledger.ledger_service import apply_stock_movement
from app.core.exceptions import ResourceNotFoundError, InvalidStateTransitionError, InsufficientStockError, AppException

class TransferService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TransferRepository(db)

    async def create_transfer(self, data: TransferCreate, user_id: int) -> InternalTransfer:
        if data.from_location_id == data.to_location_id:
            raise AppException("from_location_id and to_location_id must be different", status_code=422)

        if not await self.repo.check_product_exists(data.product_id):
            raise ResourceNotFoundError("Product", data.product_id)

        if not await self.repo.check_location_exists(data.from_location_id):
            raise ResourceNotFoundError("Location", data.from_location_id)

        if not await self.repo.check_location_exists(data.to_location_id):
            raise ResourceNotFoundError("Location", data.to_location_id)

        return await self.repo.create(data, user_id)

    async def get_transfer(self, transfer_id: int) -> InternalTransfer:
        transfer = await self.repo.get_by_id(transfer_id)
        if not transfer:
            raise ResourceNotFoundError("InternalTransfer", transfer_id)
        return transfer

    async def list_transfers(
        self,
        status: Optional[DocumentStatus] = None,
        product_id: Optional[int] = None,
        from_location_id: Optional[int] = None,
        to_location_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[InternalTransfer], int]:
        return await self.repo.list_transfers(
            status=status,
            product_id=product_id,
            from_location_id=from_location_id,
            to_location_id=to_location_id,
            page=page,
            page_size=page_size,
        )

    async def validate_transfer(self, transfer_id: int) -> InternalTransfer:
        transfer = await self.get_transfer(transfer_id)
        if transfer.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Internal transfer is already validated and done")
        if transfer.status == DocumentStatus.canceled:
            raise InvalidStateTransitionError("Canceled internal transfer cannot be validated")

        # 1. Check sufficiency at source location
        source_avail = await self.repo.get_source_stock_quantity(transfer.product_id, transfer.from_location_id)
        if source_avail < transfer.quantity:
            raise InsufficientStockError(
                product_id=transfer.product_id,
                location_id=transfer.from_location_id,
                requested=float(transfer.quantity),
                available=float(source_avail),
            )

        # 2. Perform paired ledger movements inside one transaction
        # Out from source location
        await apply_stock_movement(
            db=self.db,
            product_id=transfer.product_id,
            location_id=transfer.from_location_id,
            change_qty=-transfer.quantity,
            movement_type=MovementType.transfer_out,
            reference_table="internal_transfers",
            reference_id=transfer.id,
        )

        # In to destination location
        await apply_stock_movement(
            db=self.db,
            product_id=transfer.product_id,
            location_id=transfer.to_location_id,
            change_qty=transfer.quantity,
            movement_type=MovementType.transfer_in,
            reference_table="internal_transfers",
            reference_id=transfer.id,
        )

        transfer.status = DocumentStatus.done
        transfer.validated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return await self.get_transfer(transfer.id)

    async def cancel_transfer(self, transfer_id: int) -> InternalTransfer:
        transfer = await self.get_transfer(transfer_id)
        if transfer.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Validated internal transfer cannot be canceled")
        if transfer.status == DocumentStatus.canceled:
            return transfer

        transfer.status = DocumentStatus.canceled
        await self.db.commit()
        return await self.get_transfer(transfer.id)
