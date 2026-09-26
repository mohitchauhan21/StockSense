from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.models.documents import DocumentStatus
from app.modules.deliveries.deliveries_schemas import DeliveryCreate, DeliveryUpdate, DeliveryOrderOut, DeliveryOrderListOut
from app.modules.deliveries.deliveries_service import DeliveryService

router = APIRouter(prefix="/deliveries", tags=["Delivery Orders"])

@router.post("", response_model=DeliveryOrderOut, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    data: DeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.create_delivery(data, current_user.id)

@router.get("", response_model=DeliveryOrderListOut)
async def list_deliveries(
    status: Optional[DocumentStatus] = None,
    warehouse_id: Optional[int] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    items, total_count = await service.list_deliveries(
        status=status,
        warehouse_id=warehouse_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
    return DeliveryOrderListOut(items=items, total_count=total_count)

@router.get("/{id}", response_model=DeliveryOrderOut)
async def get_delivery(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.get_delivery(id)

@router.put("/{id}", response_model=DeliveryOrderOut)
async def update_delivery(
    id: int,
    data: DeliveryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.update_delivery(id, data)

@router.post("/{id}/validate", response_model=DeliveryOrderOut)
async def validate_delivery(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.validate_delivery(id)

@router.post("/{id}/cancel", response_model=DeliveryOrderOut)
async def cancel_delivery(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.cancel_delivery(id)
