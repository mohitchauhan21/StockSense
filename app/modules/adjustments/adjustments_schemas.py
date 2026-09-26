from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class AdjustmentCreate(BaseModel):
    product_id: int
    location_id: int
    counted_qty: Decimal = Field(ge=0)
    reason: Optional[str] = Field(None, max_length=255)

class AdjustmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    location_id: int
    system_qty: float
    counted_qty: float
    difference: float
    reason: Optional[str] = None
    created_by: int
    created_at: datetime

class AdjustmentListOut(BaseModel):
    items: List[AdjustmentOut]
    total_count: int
