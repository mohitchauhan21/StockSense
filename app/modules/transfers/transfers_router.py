from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.models.documents import DocumentStatus
from app.modules.transfers.transfers_schemas import TransferCreate, TransferOut, TransferListOut
from app.modules.transfers.transfers_service import TransferService

router = APIRouter(prefix="/transfers", tags=["Internal Transfers"])

@router.post("", response_model=TransferOut, status_code=status.HTTP_201_CREATED)
async def create_transfer(
    data: TransferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransferService(db)
    return await service.create_transfer(data, current_user.id)

@router.get("", response_model=TransferListOut)
async def list_transfers(
    status: Optional[DocumentStatus] = None,
    product_id: Optional[int] = Query(None),
    from_location_id: Optional[int] = Query(None),
    to_location_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransferService(db)
    items, total_count = await service.list_transfers(
        status=status,
        product_id=product_id,
        from_location_id=from_location_id,
        to_location_id=to_location_id,
        page=page,
        page_size=page_size,
    )
    return TransferListOut(items=items, total_count=total_count)

@router.get("/{id}", response_model=TransferOut)
async def get_transfer(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransferService(db)
    return await service.get_transfer(id)

@router.post("/{id}/validate", response_model=TransferOut)
async def validate_transfer(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransferService(db)
    return await service.validate_transfer(id)

@router.post("/{id}/cancel", response_model=TransferOut)
async def cancel_transfer(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TransferService(db)
    return await service.cancel_transfer(id)
