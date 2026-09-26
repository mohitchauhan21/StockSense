from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, OTPCode, UserRole, OTPPurpose

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    return res.scalar_one_or_none()

async def create_user(
    db: AsyncSession, name: str, email: str, password_hash: str, role: UserRole = UserRole.staff
) -> User:
    user = User(name=name, email=email, password_hash=password_hash, role=role)
    db.add(user)
    await db.flush()
    return user

async def create_otp(
    db: AsyncSession, user_id: int, code_hash: str, purpose: OTPPurpose, expires_at: datetime
) -> OTPCode:
    otp = OTPCode(user_id=user_id, code_hash=code_hash, purpose=purpose, expires_at=expires_at)
    db.add(otp)
    await db.flush()
    return otp

async def get_latest_valid_otp(db: AsyncSession, user_id: int, purpose: OTPPurpose) -> Optional[OTPCode]:
    stmt = (
        select(OTPCode)
        .where(
            OTPCode.user_id == user_id,
            OTPCode.purpose == purpose,
            OTPCode.consumed_at.is_(None),
        )
        .order_by(OTPCode.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().first()

async def consume_otp(db: AsyncSession, otp_id: int) -> None:
    now = datetime.now(timezone.utc)
    stmt = update(OTPCode).where(OTPCode.id == otp_id).values(consumed_at=now)
    await db.execute(stmt)

async def update_user_password(db: AsyncSession, user_id: int, password_hash: str) -> None:
    stmt = update(User).where(User.id == user_id).values(password_hash=password_hash)
    await db.execute(stmt)
