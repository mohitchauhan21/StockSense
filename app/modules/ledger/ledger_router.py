from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.models.ledger import MovementType
from app.modules.ledger.ledger_schemas import StockLedgerOut, StockLedgerListOut, ProductBalanceCheckOut
from app.modules.ledger.ledger_service import LedgerService

router = APIRouter(prefix="/ledger", tags=["Stock Ledger"])

@router.get("", response_model=StockLedgerListOut)
async def list_ledger(
    product_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    movement_type: Optional[MovementType] = Query(None),
    reference_table: Optional[str] = Query(None),
    reference_id: Optional[int] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LedgerService(db)
    items, total_count = await service.list_ledger(
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
    return StockLedgerListOut(items=items, total_count=total_count)

@router.get("/product/{id}/balance", response_model=ProductBalanceCheckOut)
async def get_product_balance_check(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LedgerService(db)
    return await service.get_product_balance_check(id)
