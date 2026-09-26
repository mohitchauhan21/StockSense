import enum
from decimal import Decimal
from sqlalchemy import Numeric, ForeignKey, String, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin

class MovementType(str, enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    transfer_out = "transfer_out"
    transfer_in = "transfer_in"
    adjustment = "adjustment"

class StockLedger(Base, TimestampMixin):
    __tablename__ = "stock_ledger"
    __table_args__ = (
        Index("ix_stock_ledger_prod_loc_created", "product_id", "location_id", "created_at"),
        Index("ix_stock_ledger_ref", "reference_table", "reference_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    change_qty: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    balance_after: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    movement_type: Mapped[MovementType] = mapped_column(Enum(MovementType, native_enum=True), nullable=False)
    reference_table: Mapped[str] = mapped_column(String(50), nullable=False)
    reference_id: Mapped[int] = mapped_column(nullable=False)
