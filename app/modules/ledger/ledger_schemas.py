from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.ledger import MovementType

class StockLedgerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    location_id: int
    change_qty: float
    balance_after: float
    movement_type: MovementType
    reference_table: str
    reference_id: int
    created_at: datetime

class StockLedgerListOut(BaseModel):
    items: List[StockLedgerOut]
    total_count: int

class LocationBalanceCheck(BaseModel):
    location_id: int
    stock_level_qty: float
    ledger_sum_qty: float
    is_consistent: bool

class ProductBalanceCheckOut(BaseModel):
    product_id: int
    locations: List[LocationBalanceCheck]
    overall_consistent: bool
