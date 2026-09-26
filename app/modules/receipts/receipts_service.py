from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import Receipt, DocumentStatus
from app.models.ledger import MovementType
from app.modules.receipts.receipts_repository import ReceiptRepository
from app.modules.receipts.receipts_schemas import ReceiptCreate, ReceiptUpdate
from app.modules.ledger.ledger_service import apply_stock_movement
from app.core.exceptions import ResourceNotFoundError, InvalidStateTransitionError, AppException

class ReceiptService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReceiptRepository(db)

    async def create_receipt(self, data: ReceiptCreate, user_id: int) -> Receipt:
        if not data.items:
            raise AppException("Receipt items list cannot be empty", status_code=422)

        product_ids = [item.product_id for item in data.items]
        if not await self.repo.check_products_exist(product_ids):
            raise ResourceNotFoundError("Product", product_ids)

        location_ids = [item.location_id for item in data.items]
        if not await self.repo.check_locations_exist(location_ids):
            raise ResourceNotFoundError("Location", location_ids)

        return await self.repo.create(data, user_id)

    async def get_receipt(self, receipt_id: int) -> Receipt:
        receipt = await self.repo.get_by_id(receipt_id)
        if not receipt:
            raise ResourceNotFoundError("Receipt", receipt_id)
        return receipt

    async def list_receipts(
        self,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Receipt], int]:
        return await self.repo.list_receipts(
            status=status,
            warehouse_id=warehouse_id,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

    async def update_receipt(self, receipt_id: int, data: ReceiptUpdate) -> Receipt:
        receipt = await self.get_receipt(receipt_id)
        if receipt.status in (DocumentStatus.done, DocumentStatus.canceled):
            raise InvalidStateTransitionError(f"Receipt is already {receipt.status.value} and cannot be edited")

        if data.items is not None:
            if not data.items:
                raise AppException("Receipt items list cannot be empty", status_code=422)

            product_ids = [item.product_id for item in data.items]
            if not await self.repo.check_products_exist(product_ids):
                raise ResourceNotFoundError("Product", product_ids)

            location_ids = [item.location_id for item in data.items]
            if not await self.repo.check_locations_exist(location_ids):
                raise ResourceNotFoundError("Location", location_ids)

        return await self.repo.update(receipt, data)

    async def validate_receipt(self, receipt_id: int) -> Receipt:
        receipt = await self.get_receipt(receipt_id)
        if receipt.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Receipt is already validated and done")
        if receipt.status == DocumentStatus.canceled:
            raise InvalidStateTransitionError("Canceled receipt cannot be validated")

        # Apply stock movement for each item within the same transaction
        for item in receipt.items:
            await apply_stock_movement(
                db=self.db,
                product_id=item.product_id,
                location_id=item.location_id,
                change_qty=item.quantity,
                movement_type=MovementType.receipt,
                reference_table="receipts",
                reference_id=receipt.id,
            )

        receipt.status = DocumentStatus.done
        receipt.validated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return await self.get_receipt(receipt.id)

    async def cancel_receipt(self, receipt_id: int) -> Receipt:
        receipt = await self.get_receipt(receipt_id)
        if receipt.status == DocumentStatus.done:
            raise InvalidStateTransitionError("Validated receipt cannot be canceled")
        if receipt.status == DocumentStatus.canceled:
            return receipt

        receipt.status = DocumentStatus.canceled
        await self.db.commit()
        return await self.get_receipt(receipt.id)
