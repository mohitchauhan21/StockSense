import pytest
import pytest_asyncio
from decimal import Decimal
from typing import Optional
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from app.main import app
from app.core.database import get_db
from app.core.config import settings
from app.models import Base, Product, Category, Warehouse, Location, User, UserRole

@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine(settings.TEST_DATABASE_URL, poolclass=NullPool, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(test_engine):
    SessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with SessionLocal() as session:
        for t in reversed(Base.metadata.sorted_tables):
            await session.execute(text(f'DELETE FROM "{t.name}";'))
        await session.commit()
        yield session

@pytest_asyncio.fixture
async def client(test_engine, db_session):
    SessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    
    async def override_get_db():
        async with SessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def auth_headers(client):
    await client.post(
        "/auth/signup",
        json={"name": "Test Manager", "email": "manager@test.com", "password": "Passw0rd1", "role": "manager"},
    )
    login_res = await client.post(
        "/auth/login", json={"email": "manager@test.com", "password": "Passw0rd1"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def staff_auth_headers(client):
    await client.post(
        "/auth/signup",
        json={"name": "Test Staff", "email": "staff@test.com", "password": "Passw0rd1", "role": "staff"},
    )
    login_res = await client.post(
        "/auth/login", json={"email": "staff@test.com", "password": "Passw0rd1"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

import uuid

@pytest_asyncio.fixture
def make_category(db_session):
    async def _make_category(name: Optional[str] = None) -> Category:
        if name is None:
            name = f"Category_{uuid.uuid4().hex[:8]}"
        category = Category(name=name)
        db_session.add(category)
        await db_session.commit()
        await db_session.refresh(category)
        return category
    return _make_category

@pytest_asyncio.fixture
def make_product(db_session):
    async def _make_product(
        name: Optional[str] = None,
        sku: Optional[str] = None,
        unit_of_measure: str = "unit",
        reorder_point: float = 10.0,
        reorder_qty: float = 50.0,
        category_id: Optional[int] = None,
    ) -> Product:
        uid = uuid.uuid4().hex[:8]
        if name is None:
            name = f"Product_{uid}"
        if sku is None:
            sku = f"SKU_{uid}"
        product = Product(
            name=name,
            sku=sku,
            unit_of_measure=unit_of_measure,
            reorder_point=Decimal(str(reorder_point)),
            reorder_qty=Decimal(str(reorder_qty)),
            category_id=category_id,
        )
        db_session.add(product)
        await db_session.commit()
        await db_session.refresh(product)
        return product
    return _make_product

@pytest_asyncio.fixture
def make_warehouse(db_session):
    async def _make_warehouse(name: Optional[str] = None, address: str = "123 Main St") -> Warehouse:
        if name is None:
            name = f"Warehouse_{uuid.uuid4().hex[:8]}"
        wh = Warehouse(name=name, address=address)
        db_session.add(wh)
        await db_session.commit()
        await db_session.refresh(wh)
        return wh
    return _make_warehouse

@pytest_asyncio.fixture
def make_location(db_session, make_warehouse):
    async def _make_location(name: Optional[str] = None, warehouse_id: Optional[int] = None) -> Location:
        if name is None:
            name = f"Location_{uuid.uuid4().hex[:8]}"
        if warehouse_id is None:
            wh = await make_warehouse()
            warehouse_id = wh.id
        loc = Location(warehouse_id=warehouse_id, name=name)
        db_session.add(loc)
        await db_session.commit()
        await db_session.refresh(loc)
        return loc
    return _make_location
