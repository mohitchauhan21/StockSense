import random
from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole, OTPPurpose
from app.modules.auth import auth_repository as repo
from app.modules.auth.auth_schemas import UserCreate, LoginRequest, ResetPasswordRequest, TokenResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, get_now
from app.core.exceptions import ResourceConflictError, UnauthorizedError, AppException
from app.core.config import settings

async def signup_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await repo.get_user_by_email(db, data.email)
    if existing:
        raise ResourceConflictError("Email already registered")
    
    pwd_hash = hash_password(data.password)
    user = await repo.create_user(
        db, name=data.name, email=data.email, password_hash=pwd_hash, role=data.role or UserRole.staff
    )
    await db.commit()
    await db.refresh(user)
    return user

async def authenticate_user(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    user = await repo.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid credentials")
    
    if not user.is_active:
        raise UnauthorizedError("User account is inactive")
    
    payload = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

async def forgot_password(db: AsyncSession, email: str) -> dict:
    user = await repo.get_user_by_email(db, email)
    if user:
        # Generate 6-digit numeric OTP
        raw_otp = f"{random.randint(100000, 999999)}"
        code_hash = hash_password(raw_otp)
        expires_at = get_now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        await repo.create_otp(db, user_id=user.id, code_hash=code_hash, purpose=OTPPurpose.password_reset, expires_at=expires_at)
        await db.commit()
        # SMTP email logic can be triggered here silently
    return {"success": True, "message": "If the email is registered, a password reset code has been sent."}

async def reset_password(db: AsyncSession, data: ResetPasswordRequest) -> dict:
    user = await repo.get_user_by_email(db, data.email)
    if not user:
        raise AppException(message="Invalid or expired OTP", status_code=400)
    
    otp_record = await repo.get_latest_valid_otp(db, user.id, OTPPurpose.password_reset)
    if not otp_record:
        raise AppException(message="Invalid or expired OTP", status_code=400)
    
    if otp_record.expires_at < get_now():
        raise AppException(message="Invalid or expired OTP", status_code=400)
    
    if not verify_password(data.otp, otp_record.code_hash):
        raise AppException(message="Invalid or expired OTP", status_code=400)
    
    await repo.consume_otp(db, otp_record.id)
    new_pwd_hash = hash_password(data.new_password)
    await repo.update_user_password(db, user.id, new_pwd_hash)
    await db.commit()
    return {"success": True, "message": "Password updated successfully"}

async def refresh_access_token(db: AsyncSession, refresh_token_str: str) -> TokenResponse:
    payload = decode_token(refresh_token_str)
    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid refresh token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid refresh token")
    
    user = await repo.get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        raise UnauthorizedError("Invalid refresh token")
    
    new_payload = {"sub": str(user.id), "role": user.role.value}
    new_access = create_access_token(new_payload)
    new_refresh = create_refresh_token(new_payload)
    return TokenResponse(access_token=new_access, refresh_token=new_refresh)
