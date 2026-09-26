from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.warehouse import Warehouse, Location
from app.modules.warehouses import warehouses_repository as repo
from app.modules.warehouses.warehouses_schemas import WarehouseCreate, WarehouseUpdate, LocationCreate
from app.core.exceptions import ResourceConflictError, ResourceNotFoundError

async def list_warehouses(db: AsyncSession) -> List[Warehouse]:
    return await repo.get_all_warehouses(db)

async def create_warehouse(db: AsyncSession, data: WarehouseCreate) -> Warehouse:
    existing = await repo.get_warehouse_by_name(db, data.name)
    if existing:
        raise ResourceConflictError(f"Warehouse '{data.name}' already exists")
    wh = await repo.create_warehouse(db, data.name, data.address)
    await db.commit()
    await db.refresh(wh)
    return wh

async def update_warehouse(db: AsyncSession, warehouse_id: int, data: WarehouseUpdate) -> Warehouse:
    wh = await repo.get_warehouse_by_id(db, warehouse_id)
    if not wh:
        raise ResourceNotFoundError("Warehouse", warehouse_id)
    if data.name and data.name != wh.name:
        existing = await repo.get_warehouse_by_name(db, data.name)
        if existing:
            raise ResourceConflictError(f"Warehouse '{data.name}' already exists")
    updated = await repo.update_warehouse(db, warehouse_id, data.name, data.address)
    await db.commit()
    await db.refresh(updated)
    return updated

async def delete_warehouse(db: AsyncSession, warehouse_id: int) -> None:
    wh = await repo.get_warehouse_by_id(db, warehouse_id)
    if not wh:
        raise ResourceNotFoundError("Warehouse", warehouse_id)
    total_stock = await repo.get_warehouse_total_stock(db, warehouse_id)
    if total_stock > 0:
        raise ResourceConflictError(f"Cannot delete warehouse with non-zero stock ({total_stock} units remaining)")
    await repo.delete_warehouse(db, warehouse_id)
    await db.commit()

async def create_location(db: AsyncSession, data: LocationCreate) -> Location:
    wh = await repo.get_warehouse_by_id(db, data.warehouse_id)
    if not wh:
        raise ResourceNotFoundError("Warehouse", data.warehouse_id)
    existing = await repo.get_location_by_warehouse_and_name(db, data.warehouse_id, data.name)
    if existing:
        raise ResourceConflictError(f"Location '{data.name}' already exists in warehouse '{wh.name}'")
    loc = await repo.create_location(db, data.warehouse_id, data.name)
    await db.commit()
    await db.refresh(loc)
    return loc

async def list_warehouse_locations(db: AsyncSession, warehouse_id: int) -> List[Tuple[Location, float]]:
    wh = await repo.get_warehouse_by_id(db, warehouse_id)
    if not wh:
        raise ResourceNotFoundError("Warehouse", warehouse_id)
    return await repo.list_locations_by_warehouse_with_stock(db, warehouse_id)
