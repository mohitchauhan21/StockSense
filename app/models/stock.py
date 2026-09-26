from decimal import Decimal
from sqlalchemy import Numeric, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class StockLevel(Base):
    __tablename__ = "stock_levels"
    __table_args__ = (
        UniqueConstraint("product_id", "location_id", name="uq_product_location"),
        CheckConstraint("quantity >= 0", name="ck_quantity_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(14, 3), default=Decimal("0"), nullable=False)

    product = relationship("Product", back_populates="stock_levels")
    location = relationship("Location", back_populates="stock_levels")
