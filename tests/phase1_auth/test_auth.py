import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.models.user import OTPCode
from app.core.security import hash_password, create_access_token

@pytest.mark.asyncio
async def test_signup_valid_data(client):
    res = await client.post(
        "/auth/signup",
        json={"name": "Alice Manager", "email": "alice@example.com", "password": "Password123", "role": "manager"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "manager"
    assert "password" not in data

@pytest.mark.asyncio
async def test_signup_duplicate_email(client):
    await client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "dup@example.com", "password": "Password123"},
    )
    res = await client.post(
        "/auth/signup",
        json={"name": "Alice 2", "email": "dup@example.com", "password": "Password123"},
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_signup_invalid_email(client):
    res = await client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "not-an-email", "password": "Password123"},
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_signup_short_password(client):
    res = await client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "short@example.com", "password": "pass1"},
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_login_correct_credentials(client):
    await client.post(
        "/auth/signup",
        json={"name": "Bob", "email": "bob@example.com", "password": "Password123"},
    )
    res = await client.post(
        "/auth/login",
        json={"email": "bob@example.com", "password": "Password123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/auth/signup",
        json={"name": "Bob", "email": "bob2@example.com", "password": "Password123"},
    )
    res = await client.post(
        "/auth/login",
        json={"email": "bob2@example.com", "password": "WrongPassword123"},
    )
    assert res.status_code == 401
    assert res.json()["message"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_login_non_existent_email(client):
    res = await client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "Password123"},
    )
    assert res.status_code == 401
    assert res.json()["message"] == "Invalid credentials"

@pytest.mark.asyncio
async def test_protected_route_without_token(client):
    res = await client.get("/users/me")
    assert res.status_code in (401, 403)

@pytest.mark.asyncio
async def test_protected_route_with_expired_token(client):
    expired_token = create_access_token({"sub": "1", "role": "staff"}, expires_delta=timedelta(seconds=-10))
    res = await client.get("/users/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_forgot_password_existing_email(client, db_session):
    await client.post(
        "/auth/signup",
        json={"name": "Carol", "email": "carol@example.com", "password": "Password123"},
    )
    res = await client.post("/auth/forgot-password", json={"email": "carol@example.com"})
    assert res.status_code == 200

    stmt = select(OTPCode)
    result = await db_session.execute(stmt)
    otps = result.scalars().all()
    assert len(otps) > 0
    await db_session.close()

@pytest.mark.asyncio
async def test_forgot_password_non_existent_email(client):
    res = await client.post("/auth/forgot-password", json={"email": "unknown@example.com"})
    assert res.status_code == 200

@pytest.mark.asyncio
async def test_reset_password_flow(client, db_session):
    await client.post(
        "/auth/signup",
        json={"name": "Dave", "email": "dave@example.com", "password": "Password123"},
    )
    otp_code = "123456"
    otp_hash = hash_password(otp_code)

    await client.post("/auth/forgot-password", json={"email": "dave@example.com"})
    
    stmt = select(OTPCode).order_by(OTPCode.created_at.desc())
    res = await db_session.execute(stmt)
    otp = res.scalars().first()
    otp.code_hash = otp_hash
    await db_session.commit()

    reset_res = await client.post(
        "/auth/reset-password",
        json={"email": "dave@example.com", "otp": "123456", "new_password": "NewPassword123"},
    )
    assert reset_res.status_code == 200

    old_login = await client.post("/auth/login", json={"email": "dave@example.com", "password": "Password123"})
    assert old_login.status_code == 401

    new_login = await client.post("/auth/login", json={"email": "dave@example.com", "password": "NewPassword123"})
    assert new_login.status_code == 200
    await db_session.close()

@pytest.mark.asyncio
async def test_reset_password_expired_otp(client, db_session):
    await client.post(
        "/auth/signup",
        json={"name": "Eve", "email": "eve@example.com", "password": "Password123"},
    )
    await client.post("/auth/forgot-password", json={"email": "eve@example.com"})
    
    stmt = select(OTPCode).order_by(OTPCode.created_at.desc())
    res = await db_session.execute(stmt)
    otp = res.scalars().first()
    otp.expires_at = datetime.now(timezone.utc) - timedelta(minutes=5)
    await db_session.commit()

    reset_res = await client.post(
        "/auth/reset-password",
        json={"email": "eve@example.com", "otp": "000000", "new_password": "NewPassword123"},
    )
    assert reset_res.status_code == 400
    await db_session.close()

@pytest.mark.asyncio
async def test_refresh_token_issues_new_token(client):
    await client.post(
        "/auth/signup",
        json={"name": "Frank", "email": "frank@example.com", "password": "Password123"},
    )
    login_res = await client.post(
        "/auth/login", json={"email": "frank@example.com", "password": "Password123"}
    )
    refresh_token = login_res.json()["refresh_token"]

    refresh_res = await client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()
