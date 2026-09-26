from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.modules.adjustments.adjustments_schemas import AdjustmentCreate, AdjustmentOut, AdjustmentListOut
from app.modules.adjustments.adjustments_service import AdjustmentService

router = APIRouter(prefix="/adjustments", tags=["Stock Adjustments"])

@router.post("", response_model=AdjustmentOut, status_code=status.HTTP_201_CREATED)
async def create_adjustment(
    data: AdjustmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdjustmentService(db)
    return await service.create_adjustment(data, current_user.id)

@router.get("", response_model=AdjustmentListOut)
async def list_adjustments(
    product_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdjustmentService(db)
    items, total_count = await service.list_adjustments(
        product_id=product_id,
        location_id=location_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
    return AdjustmentListOut(items=items, total_count=total_count)

@router.get("/{id}", response_model=AdjustmentOut)
async def get_adjustment(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdjustmentService(db)
    return await service.get_adjustment(id)
