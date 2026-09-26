from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Category
from app.modules.categories import categories_repository as repo
from app.modules.categories.categories_schemas import CategoryCreate
from app.core.exceptions import ResourceConflictError

async def list_categories(db: AsyncSession) -> List[Category]:
    return await repo.get_all_categories(db)

async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    existing = await repo.get_category_by_name(db, data.name)
    if existing:
        raise ResourceConflictError(f"Category '{data.name}' already exists")
    category = await repo.create_category(db, data.name)
    await db.commit()
    await db.refresh(category)
    return category
