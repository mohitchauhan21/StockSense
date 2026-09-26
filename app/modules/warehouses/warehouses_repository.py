from typing import List, Optional, Tuple
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.warehouse import Warehouse, Location
from app.models.stock import StockLevel

async def get_all_warehouses(db: AsyncSession) -> List[Warehouse]:
    stmt = select(Warehouse).order_by(Warehouse.id.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

async def get_warehouse_by_id(db: AsyncSession, warehouse_id: int) -> Optional[Warehouse]:
    stmt = select(Warehouse).where(Warehouse.id == warehouse_id)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def get_warehouse_by_name(db: AsyncSession, name: str) -> Optional[Warehouse]:
    stmt = select(Warehouse).where(Warehouse.name == name)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def create_warehouse(db: AsyncSession, name: str, address: Optional[str]) -> Warehouse:
    wh = Warehouse(name=name, address=address)
    db.add(wh)
    await db.flush()
    return wh

async def update_warehouse(db: AsyncSession, warehouse_id: int, name: Optional[str], address: Optional[str]) -> Optional[Warehouse]:
    wh = await get_warehouse_by_id(db, warehouse_id)
    if not wh:
        return None
    if name is not None:
        wh.name = name
    if address is not None:
        wh.address = address
    await db.flush()
    return wh

async def get_warehouse_total_stock(db: AsyncSession, warehouse_id: int) -> float:
    stmt = (
        select(func.coalesce(func.sum(StockLevel.quantity), 0))
        .join(Location, Location.id == StockLevel.location_id)
        .where(Location.warehouse_id == warehouse_id)
    )
    res = await db.execute(stmt)
    return float(res.scalar_one())

async def delete_warehouse(db: AsyncSession, warehouse_id: int) -> bool:
    wh = await get_warehouse_by_id(db, warehouse_id)
    if not wh:
        return False
    await db.delete(wh)
    await db.flush()
    return True

# Location Queries
async def get_location_by_id(db: AsyncSession, location_id: int) -> Optional[Location]:
    stmt = select(Location).where(Location.id == location_id)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def get_location_by_warehouse_and_name(db: AsyncSession, warehouse_id: int, name: str) -> Optional[Location]:
    stmt = select(Location).where(Location.warehouse_id == warehouse_id, Location.name == name)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def create_location(db: AsyncSession, warehouse_id: int, name: str) -> Location:
    loc = Location(warehouse_id=warehouse_id, name=name)
    db.add(loc)
    await db.flush()
    return loc

async def list_locations_by_warehouse_with_stock(db: AsyncSession, warehouse_id: int) -> List[Tuple[Location, float]]:
    stmt = (
        select(Location, func.coalesce(func.sum(StockLevel.quantity), 0).label("total_stock"))
        .outerjoin(StockLevel, StockLevel.location_id == Location.id)
        .where(Location.warehouse_id == warehouse_id)
        .group_by(Location.id)
        .order_by(Location.id.asc())
    )
    res = await db.execute(stmt)
    return [(row[0], float(row[1])) for row in res.all()]
