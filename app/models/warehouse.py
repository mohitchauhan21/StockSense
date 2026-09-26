from typing import Optional, List
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    locations = relationship("Location", back_populates="warehouse", cascade="all, delete-orphan")

class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        UniqueConstraint("warehouse_id", "name", name="uq_warehouse_location_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    warehouse = relationship("Warehouse", back_populates="locations")
    stock_levels = relationship("StockLevel", back_populates="location", cascade="all, delete-orphan")
