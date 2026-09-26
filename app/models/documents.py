import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Numeric, ForeignKey, Enum, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class DocumentStatus(str, enum.Enum):
    draft = "draft"
    waiting = "waiting"
    ready = "ready"
    done = "done"
    canceled = "canceled"

class Receipt(Base, TimestampMixin):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus, native_enum=True), default=DocumentStatus.draft, nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    validated_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_receipt_item_qty_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    receipt_id: Mapped[int] = mapped_column(ForeignKey("receipts.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)

    receipt = relationship("Receipt", back_populates="items")
    product = relationship("Product")
    location = relationship("Location")

class DeliveryOrder(Base, TimestampMixin):
    __tablename__ = "delivery_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus, native_enum=True), default=DocumentStatus.draft, nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    validated_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    items = relationship("DeliveryItem", back_populates="delivery_order", cascade="all, delete-orphan")

class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_delivery_item_qty_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    delivery_order_id: Mapped[int] = mapped_column(ForeignKey("delivery_orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)

    delivery_order = relationship("DeliveryOrder", back_populates="items")
    product = relationship("Product")
    location = relationship("Location")

class InternalTransfer(Base, TimestampMixin):
    __tablename__ = "internal_transfers"
    __table_args__ = (
        CheckConstraint("from_location_id != to_location_id", name="ck_transfer_different_locations"),
        CheckConstraint("quantity > 0", name="ck_transfer_qty_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus, native_enum=True), default=DocumentStatus.draft, nullable=False)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    validated_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    product = relationship("Product")
    from_location = relationship("Location", foreign_keys=[from_location_id])
    to_location = relationship("Location", foreign_keys=[to_location_id])

class StockAdjustment(Base, TimestampMixin):
    __tablename__ = "stock_adjustments"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False)
    system_qty: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    counted_qty: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    difference: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    product = relationship("Product")
    location = relationship("Location")
