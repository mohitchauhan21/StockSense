from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    address: Optional[str] = Field(default=None, max_length=255)

class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    address: Optional[str] = Field(default=None, max_length=255)

class WarehouseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    address: Optional[str]

class LocationCreate(BaseModel):
    warehouse_id: int
    name: str = Field(min_length=1, max_length=120)

class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    warehouse_id: int
    name: str
    total_stock: float = 0.0
