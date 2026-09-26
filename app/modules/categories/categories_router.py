from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.modules.auth.auth_router import get_current_user, require_role
from app.modules.categories.categories_schemas import CategoryCreate, CategoryOut
from app.modules.categories import categories_service as service

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = await service.list_categories(db)
    return [CategoryOut.model_validate(c) for c in categories]

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    category = await service.create_category(db, data)
    return CategoryOut.model_validate(category)
