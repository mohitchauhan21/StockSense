from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.modules.auth.auth_router import get_current_user, require_role
from app.modules.products import products_service as service
from app.modules.products.products_schemas import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductDetailOut,
    PaginatedProductsOut,
)

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=PaginatedProductsOut)
async def list_products(
    category_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=True),
    low_stock_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products, total_count = await service.list_products(
        db, category_id=category_id, search=search, is_active=is_active, low_stock_only=low_stock_only, page=page, page_size=page_size
    )
    items = [ProductOut.model_validate(p) for p in products]
    return PaginatedProductsOut(items=items, total_count=total_count, page=page, page_size=page_size)

@router.get("/{id}", response_model=ProductDetailOut)
async def get_product(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await service.get_product_detail(db, id)

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    product = await service.create_product(db, data)
    return ProductOut.model_validate(product)

@router.put("/{id}", response_model=ProductOut)
async def update_product(
    id: int,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    product = await service.update_product(db, id, data)
    return ProductOut.model_validate(product)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    await service.delete_product(db, id)
    return None
