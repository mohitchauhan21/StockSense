from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.documents import DocumentStatus

class DeliveryItemIn(BaseModel):
    product_id: int
    location_id: int
    quantity: Decimal = Field(gt=0)

class DeliveryCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=200)
    items: List[DeliveryItemIn] = Field(min_length=1)

class DeliveryUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    items: Optional[List[DeliveryItemIn]] = Field(None, min_length=1)

class DeliveryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    location_id: int
    quantity: float

class DeliveryOrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_name: str
    status: DocumentStatus
    created_by: int
    created_at: datetime
    validated_at: Optional[datetime] = None
    items: List[DeliveryItemOut]

class DeliveryOrderListOut(BaseModel):
    items: List[DeliveryOrderOut]
    total_count: int

class InsufficientItem(BaseModel):
    product_id: int
    location_id: int
    requested: float
    available: float
