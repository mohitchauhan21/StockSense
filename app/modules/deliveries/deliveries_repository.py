from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Tuple, Dict
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import DeliveryOrder, DeliveryItem, DocumentStatus
from app.models import Product, Location
from app.models.stock import StockLevel
from app.modules.deliveries.deliveries_schemas import DeliveryCreate, DeliveryUpdate

class DeliveryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_products_exist(self, product_ids: List[int]) -> bool:
        stmt = select(func.count(Product.id)).where(Product.id.in_(product_ids), Product.is_active == True)
        res = await self.db.execute(stmt)
        count = res.scalar_one()
        return count == len(set(product_ids))

    async def check_locations_exist(self, location_ids: List[int]) -> bool:
        stmt = select(func.count(Location.id)).where(Location.id.in_(location_ids))
        res = await self.db.execute(stmt)
        count = res.scalar_one()
        return count == len(set(location_ids))

    async def create(self, data: DeliveryCreate, user_id: int) -> DeliveryOrder:
        delivery = DeliveryOrder(
            customer_name=data.customer_name,
            status=DocumentStatus.draft,
            created_by=user_id,
        )
        self.db.add(delivery)
        await self.db.flush()

        for item_in in data.items:
            item = DeliveryItem(
                delivery_order_id=delivery.id,
                product_id=item_in.product_id,
                location_id=item_in.location_id,
                quantity=item_in.quantity,
            )
            self.db.add(item)

        await self.db.commit()
        return await self.get_by_id(delivery.id)

    async def get_by_id(self, delivery_id: int) -> Optional[DeliveryOrder]:
        stmt = (
            select(DeliveryOrder)
            .options(selectinload(DeliveryOrder.items))
            .where(DeliveryOrder.id == delivery_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_deliveries(
        self,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[DeliveryOrder], int]:
        conditions = []
        if status:
            conditions.append(DeliveryOrder.status == status)
        if date_from:
            conditions.append(DeliveryOrder.created_at >= date_from)
        if date_to:
            conditions.append(DeliveryOrder.created_at <= date_to)
        if warehouse_id:
            conditions.append(
                DeliveryOrder.id.in_(
                    select(DeliveryItem.delivery_order_id)
                    .join(Location, DeliveryItem.location_id == Location.id)
                    .where(Location.warehouse_id == warehouse_id)
                )
            )

        count_stmt = select(func.count(DeliveryOrder.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total_res = await self.db.execute(count_stmt)
        total_count = total_res.scalar_one()

        query = (
            select(DeliveryOrder)
            .options(selectinload(DeliveryOrder.items))
            .order_by(DeliveryOrder.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        if conditions:
            query = query.where(and_(*conditions))

        res = await self.db.execute(query)
        deliveries = res.scalars().all()
        return deliveries, total_count

    async def update(self, delivery: DeliveryOrder, data: DeliveryUpdate) -> DeliveryOrder:
        if data.customer_name is not None:
            delivery.customer_name = data.customer_name

        if data.items is not None:
            for item in list(delivery.items):
                await self.db.delete(item)
            await self.db.flush()

            for item_in in data.items:
                item = DeliveryItem(
                    delivery_order_id=delivery.id,
                    product_id=item_in.product_id,
                    location_id=item_in.location_id,
                    quantity=item_in.quantity,
                )
                self.db.add(item)

        await self.db.commit()
        return await self.get_by_id(delivery.id)

    async def get_insufficient_items(self, items: List[DeliveryItem]) -> List[Dict]:
        insufficient = []
        for item in items:
            stmt = select(StockLevel.quantity).where(
                StockLevel.product_id == item.product_id,
                StockLevel.location_id == item.location_id,
            )
            res = await self.db.execute(stmt)
            avail = res.scalar_one_or_none() or Decimal("0")
            if avail < item.quantity:
                insufficient.append({
                    "product_id": item.product_id,
                    "location_id": item.location_id,
                    "requested": float(item.quantity),
                    "available": float(avail),
                })
        return insufficient
