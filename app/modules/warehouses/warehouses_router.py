from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.modules.auth.auth_router import get_current_user, require_role
from app.modules.warehouses import warehouses_service as service
from app.modules.warehouses.warehouses_schemas import (
    WarehouseCreate,
    WarehouseUpdate,
    WarehouseOut,
    LocationCreate,
    LocationOut,
)

router = APIRouter(prefix="", tags=["Warehouses & Locations"])

@router.get("/warehouses", response_model=List[WarehouseOut])
async def list_warehouses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    warehouses = await service.list_warehouses(db)
    return [WarehouseOut.model_validate(w) for w in warehouses]

@router.post("/warehouses", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    data: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    wh = await service.create_warehouse(db, data)
    return WarehouseOut.model_validate(wh)

@router.put("/warehouses/{id}", response_model=WarehouseOut)
async def update_warehouse(
    id: int,
    data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    wh = await service.update_warehouse(db, id, data)
    return WarehouseOut.model_validate(wh)

@router.delete("/warehouses/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    await service.delete_warehouse(db, id)
    return None

@router.post("/locations", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
async def create_location(
    data: LocationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    loc = await service.create_location(db, data)
    return LocationOut(id=loc.id, warehouse_id=loc.warehouse_id, name=loc.name, total_stock=0.0)

@router.get("/warehouses/{id}/locations", response_model=List[LocationOut])
async def list_warehouse_locations(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = await service.list_warehouse_locations(db, id)
    return [LocationOut(id=loc.id, warehouse_id=loc.warehouse_id, name=loc.name, total_stock=stock) for loc, stock in items]
