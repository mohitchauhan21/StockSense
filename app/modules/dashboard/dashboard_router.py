from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.auth.auth_router import get_current_user
from app.models.user import User
from app.models.documents import DocumentStatus
from app.modules.dashboard.dashboard_schemas import DashboardSummaryOut, UnifiedDocumentListOut
from app.modules.dashboard.dashboard_service import DashboardService
from app.modules.products.products_service import list_products

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
@router.get("/summary", response_model=DashboardSummaryOut)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DashboardService(db)
    return await service.get_summary()

@router.get("/low-stock")
async def get_low_stock_items(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    products, _ = await list_products(db, low_stock_only=True)
    return [
        {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "current_stock": p.current_stock,
            "min_reorder_point": p.min_reorder_point,
        }
        for p in products
    ]

@router.get("/documents", response_model=UnifiedDocumentListOut)
async def get_dashboard_documents(
    document_type: Optional[str] = Query(None, description="receipt, delivery, internal, or adjustment"),
    status: Optional[DocumentStatus] = Query(None),
    warehouse_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = DashboardService(db)
    items, total_count = await service.get_documents(
        document_type=document_type,
        status=status,
        warehouse_id=warehouse_id,
        category_id=category_id,
        page=page,
        page_size=page_size,
    )
    return UnifiedDocumentListOut(items=items, total_count=total_count)
