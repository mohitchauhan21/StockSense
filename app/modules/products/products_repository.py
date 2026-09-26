from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import select, func, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.stock import StockLevel
from app.models.warehouse import Location, Warehouse
from app.models.ledger import StockLedger

async def get_product_by_id(db: AsyncSession, product_id: int) -> Optional[Product]:
    stmt = select(Product).where(Product.id == product_id)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def get_product_by_sku(db: AsyncSession, sku: str) -> Optional[Product]:
    stmt = select(Product).where(Product.sku == sku)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def create_product(
    db: AsyncSession,
    name: str,
    sku: str,
    category_id: Optional[int],
    unit_of_measure: str,
    reorder_point: Decimal,
    reorder_qty: Decimal,
) -> Product:
    product = Product(
        name=name,
        sku=sku,
        category_id=category_id,
        unit_of_measure=unit_of_measure,
        reorder_point=reorder_point,
        reorder_qty=reorder_qty,
        is_active=True,
    )
    db.add(product)
    await db.flush()
    return product

async def update_product(
    db: AsyncSession,
    product_id: int,
    name: Optional[str],
    category_id: Optional[int],
    unit_of_measure: Optional[str],
    reorder_point: Optional[Decimal],
    reorder_qty: Optional[Decimal],
) -> Optional[Product]:
    product = await get_product_by_id(db, product_id)
    if not product:
        return None
    if name is not None:
        product.name = name
    if category_id is not None:
        product.category_id = category_id
    if unit_of_measure is not None:
        product.unit_of_measure = unit_of_measure
    if reorder_point is not None:
        product.reorder_point = reorder_point
    if reorder_qty is not None:
        product.reorder_qty = reorder_qty
    await db.flush()
    return product

async def soft_delete_product(db: AsyncSession, product_id: int) -> None:
    stmt = update(Product).where(Product.id == product_id).values(is_active=False)
    await db.execute(stmt)

async def check_product_ledger_history(db: AsyncSession, product_id: int) -> bool:
    stmt = select(func.count(StockLedger.id)).where(StockLedger.product_id == product_id)
    res = await db.execute(stmt)
    return (res.scalar() or 0) > 0

async def get_products_paginated(
    db: AsyncSession,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = True,
    low_stock_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Product], int]:
    # Subquery for total quantity per product
    total_stock_sub = (
        select(StockLevel.product_id, func.coalesce(func.sum(StockLevel.quantity), 0).label("total_qty"))
        .group_by(StockLevel.product_id)
        .subquery()
    )

    query = select(Product)

    if is_active is not None:
        query = query.where(Product.is_active == is_active)

    if category_id is not None:
        query = query.where(Product.category_id == category_id)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(or_(Product.name.ilike(search_pattern), Product.sku.ilike(search_pattern)))

    if low_stock_only:
        query = query.outerjoin(total_stock_sub, Product.id == total_stock_sub.c.product_id).where(
            func.coalesce(total_stock_sub.c.total_qty, 0) <= Product.reorder_point
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total_count = total_res.scalar() or 0

    query = query.order_by(Product.id.asc()).offset((page - 1) * page_size).limit(page_size)
    res = await db.execute(query)
    products = list(res.scalars().all())

    return products, total_count

async def get_product_stock_by_location(db: AsyncSession, product_id: int) -> List[Tuple[Location, Warehouse, Decimal]]:
    stmt = (
        select(Location, Warehouse, StockLevel.quantity)
        .join(Warehouse, Warehouse.id == Location.warehouse_id)
        .join(StockLevel, StockLevel.location_id == Location.id)
        .where(StockLevel.product_id == product_id)
        .order_by(Location.id.asc())
    )
    res = await db.execute(stmt)
    return [(row[0], row[1], row[2]) for row in res.all()]
