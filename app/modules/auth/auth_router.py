from typing import Callable
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.models.user import User, UserRole
from app.modules.auth import auth_service as service, auth_repository as repo
from app.modules.auth.auth_schemas import (
    UserCreate,
    UserOut,
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
)

router = APIRouter(prefix="", tags=["Auth & Users"])
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid token")
    
    user = await repo.get_user_by_id(db, int(user_id_str))
    if not user or not user.is_active:
        raise UnauthorizedError("User inactive or not found")
    return user

def require_role(required_role: str) -> Callable:
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value != required_role and current_user.role.value != UserRole.manager.value:
            raise ForbiddenError("This action requires manager role")
        return current_user
    return dependency

@router.post("/auth/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await service.signup_user(db, data)
    return UserOut.model_validate(user)

@router.post("/auth/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await service.authenticate_user(db, data)

@router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await service.forgot_password(db, data.email)

@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return await service.reset_password(db, data)

@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await service.refresh_access_token(db, data.refresh_token)

@router.get("/users/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
