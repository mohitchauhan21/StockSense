from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.documents import DocumentStatus

class ReceiptItemIn(BaseModel):
    product_id: int
    location_id: int
    quantity: Decimal = Field(gt=0)

class ReceiptCreate(BaseModel):
    supplier_name: str = Field(min_length=1, max_length=200)
    items: List[ReceiptItemIn] = Field(min_length=1)

class ReceiptUpdate(BaseModel):
    supplier_name: Optional[str] = Field(None, min_length=1, max_length=200)
    items: Optional[List[ReceiptItemIn]] = Field(None, min_length=1)

class ReceiptItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    location_id: int
    quantity: float

class ReceiptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    supplier_name: str
    status: DocumentStatus
    created_by: int
    created_at: datetime
    validated_at: Optional[datetime] = None
    items: List[ReceiptItemOut]

class ReceiptListOut(BaseModel):
    items: List[ReceiptOut]
    total_count: int
