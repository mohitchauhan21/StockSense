from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.documents import DocumentStatus

class DashboardSummaryOut(BaseModel):
    total_products_in_stock: int
    low_stock_count: int
    out_of_stock_count: int
    pending_receipts: int
    pending_deliveries: int
    scheduled_transfers: int

class UnifiedDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_type: str  # receipt, delivery, internal, adjustment
    reference: str
    status: Optional[DocumentStatus] = None
    created_at: datetime
    detail: Optional[str] = None

class UnifiedDocumentListOut(BaseModel):
    items: List[UnifiedDocumentOut]
    total_count: int
