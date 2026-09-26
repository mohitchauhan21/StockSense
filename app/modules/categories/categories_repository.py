from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Category

async def get_all_categories(db: AsyncSession) -> List[Category]:
    stmt = select(Category).order_by(Category.name.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

async def get_category_by_name(db: AsyncSession, name: str) -> Optional[Category]:
    stmt = select(Category).where(Category.name == name)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def create_category(db: AsyncSession, name: str) -> Category:
    category = Category(name=name)
    db.add(category)
    await db.flush()
    return category
