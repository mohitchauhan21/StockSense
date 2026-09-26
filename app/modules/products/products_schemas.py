from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator

class InitialStockItem(BaseModel):
    location_id: int
    quantity: float = Field(gt=0)

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=64)
    category_id: Optional[int] = None
    unit_of_measure: str = Field(min_length=1, max_length=20)
    reorder_point: float = Field(ge=0, default=0)
    reorder_qty: float = Field(ge=0, default=0)
    initial_stock: List[InitialStockItem] = Field(default_factory=list)

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    sku: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = Field(default=None, min_length=1, max_length=20)
    reorder_point: Optional[float] = Field(default=None, ge=0)
    reorder_qty: Optional[float] = Field(default=None, ge=0)

class LocationStockOut(BaseModel):
    location_id: int
    location_name: str
    warehouse_name: str
    quantity: float

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    sku: str
    category_id: Optional[int]
    unit_of_measure: str
    reorder_point: float
    reorder_qty: float
    is_active: bool

class ProductDetailOut(ProductOut):
    total_quantity: float = 0.0
    stock_by_location: List[LocationStockOut] = Field(default_factory=list)

class PaginatedProductsOut(BaseModel):
    items: List[ProductOut]
    total_count: int
    page: int
    page_size: int
