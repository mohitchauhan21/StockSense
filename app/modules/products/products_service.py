from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.ledger import MovementType
from app.modules.products import products_repository as repo
from app.modules.categories import categories_repository as cat_repo
from app.modules.warehouses import warehouses_repository as wh_repo
from app.modules.ledger.ledger_service import apply_stock_movement
from app.modules.products.products_schemas import ProductCreate, ProductUpdate, ProductDetailOut, LocationStockOut
from app.core.exceptions import DuplicateSKUError, ResourceNotFoundError, ResourceConflictError, AppException

async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    existing_sku = await repo.get_product_by_sku(db, data.sku)
    if existing_sku:
        raise DuplicateSKUError(data.sku)
    
    if data.category_id:
        cat = await cat_repo.get_all_categories(db)
        if not any(c.id == data.category_id for c in cat):
            raise ResourceNotFoundError("Category", data.category_id)
    
    product = await repo.create_product(
        db,
        name=data.name,
        sku=data.sku,
        category_id=data.category_id,
        unit_of_measure=data.unit_of_measure,
        reorder_point=Decimal(str(data.reorder_point)),
        reorder_qty=Decimal(str(data.reorder_qty)),
    )
    
    if data.initial_stock:
        for stock_item in data.initial_stock:
            loc = await wh_repo.get_location_by_id(db, stock_item.location_id)
            if not loc:
                raise ResourceNotFoundError("Location", stock_item.location_id)
            await apply_stock_movement(
                db=db,
                product_id=product.id,
                location_id=stock_item.location_id,
                change_qty=Decimal(str(stock_item.quantity)),
                movement_type=MovementType.adjustment,
                reference_table="products",
                reference_id=product.id,
            )
            
    await db.commit()
    await db.refresh(product)
    return product

async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product:
    product = await repo.get_product_by_id(db, product_id)
    if not product:
        raise ResourceNotFoundError("Product", product_id)
    
    # SKU is immutable
    if data.sku is not None and data.sku != product.sku:
        raise AppException(message="SKU is immutable after creation", status_code=422)

    if data.category_id is not None:
        cat = await cat_repo.get_all_categories(db)
        if not any(c.id == data.category_id for c in cat):
            raise ResourceNotFoundError("Category", data.category_id)

    updated = await repo.update_product(
        db,
        product_id=product_id,
        name=data.name,
        category_id=data.category_id,
        unit_of_measure=data.unit_of_measure,
        reorder_point=Decimal(str(data.reorder_point)) if data.reorder_point is not None else None,
        reorder_qty=Decimal(str(data.reorder_qty)) if data.reorder_qty is not None else None,
    )
    await db.commit()
    await db.refresh(updated)
    return updated

async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await repo.get_product_by_id(db, product_id)
    if not product:
        raise ResourceNotFoundError("Product", product_id)
    
    has_history = await repo.check_product_ledger_history(db, product_id)
    if has_history:
        raise ResourceConflictError(f"Cannot hard delete product '{product.name}' as historical ledger entries reference it")
    
    await repo.soft_delete_product(db, product_id)
    await db.commit()

async def get_product_detail(db: AsyncSession, product_id: int) -> ProductDetailOut:
    product = await repo.get_product_by_id(db, product_id)
    if not product:
        raise ResourceNotFoundError("Product", product_id)
    
    stock_rows = await repo.get_product_stock_by_location(db, product_id)
    stock_by_location = []
    total_qty = 0.0
    for loc, wh, qty in stock_rows:
        qty_float = float(qty)
        total_qty += qty_float
        stock_by_location.append(LocationStockOut(
            location_id=loc.id,
            location_name=loc.name,
            warehouse_name=wh.name,
            quantity=qty_float
        ))
    
    return ProductDetailOut(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_id=product.category_id,
        unit_of_measure=product.unit_of_measure,
        reorder_point=float(product.reorder_point),
        reorder_qty=float(product.reorder_qty),
        is_active=product.is_active,
        total_quantity=total_qty,
        stock_by_location=stock_by_location
    )

async def list_products(
    db: AsyncSession,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = True,
    low_stock_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Product], int]:
    return await repo.get_products_paginated(
        db, category_id=category_id, search=search, is_active=is_active, low_stock_only=low_stock_only, page=page, page_size=page_size
    )
