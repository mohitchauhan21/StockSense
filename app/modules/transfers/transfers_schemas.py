from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.models.documents import DocumentStatus

class TransferCreate(BaseModel):
    product_id: int
    from_location_id: int
    to_location_id: int
    quantity: Decimal = Field(gt=0)

    @model_validator(mode="after")
    def validate_different_locations(self):
        if self.from_location_id == self.to_location_id:
            raise ValueError("from_location_id and to_location_id must be different")
        return self

class TransferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    from_location_id: int
    to_location_id: int
    quantity: float
    status: DocumentStatus
    created_by: int
    created_at: datetime
    validated_at: Optional[datetime] = None

class TransferListOut(BaseModel):
    items: List[TransferOut]
    total_count: int
