from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    products = relationship("Product", back_populates="category")

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True, index=True)
    unit_of_measure: Mapped[str] = mapped_column(String(20), nullable=False)
    reorder_point: Mapped[Decimal] = mapped_column(Numeric(14, 3), default=Decimal("0"), nullable=False)
    reorder_qty: Mapped[Decimal] = mapped_column(Numeric(14, 3), default=Decimal("0"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category = relationship("Category", back_populates="products")
    stock_levels = relationship("StockLevel", back_populates="product", cascade="all, delete-orphan")
