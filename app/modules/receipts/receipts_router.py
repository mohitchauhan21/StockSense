from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.models.documents import DocumentStatus
from app.modules.receipts.receipts_schemas import ReceiptCreate, ReceiptUpdate, ReceiptOut, ReceiptListOut
from app.modules.receipts.receipts_service import ReceiptService

router = APIRouter(prefix="/receipts", tags=["Receipts"])

@router.post("", response_model=ReceiptOut, status_code=status.HTTP_201_CREATED)
async def create_receipt(
    data: ReceiptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    return await service.create_receipt(data, current_user.id)

@router.get("", response_model=ReceiptListOut)
async def list_receipts(
    status: Optional[DocumentStatus] = None,
    warehouse_id: Optional[int] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    items, total_count = await service.list_receipts(
        status=status,
        warehouse_id=warehouse_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
    return ReceiptListOut(items=items, total_count=total_count)

@router.get("/{id}", response_model=ReceiptOut)
async def get_receipt(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    return await service.get_receipt(id)

@router.put("/{id}", response_model=ReceiptOut)
async def update_receipt(
    id: int,
    data: ReceiptUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    return await service.update_receipt(id, data)

@router.post("/{id}/validate", response_model=ReceiptOut)
async def validate_receipt(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    return await service.validate_receipt(id)

@router.post("/{id}/cancel", response_model=ReceiptOut)
async def cancel_receipt(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReceiptService(db)
    return await service.cancel_receipt(id)
