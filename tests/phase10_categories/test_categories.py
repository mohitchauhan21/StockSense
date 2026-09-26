import pytest

@pytest.mark.asyncio
async def test_list_categories_empty(client, auth_headers):
    res = await client.get("/categories", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []

@pytest.mark.asyncio
async def test_create_category_success(client, auth_headers):
    res = await client.post(
        "/categories",
        json={"name": "Electronics"},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Electronics"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_category_duplicate_name_fails(client, auth_headers):
    await client.post(
        "/categories",
        json={"name": "Hardware"},
        headers=auth_headers,
    )
    res = await client.post(
        "/categories",
        json={"name": "Hardware"},
        headers=auth_headers,
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_list_categories_populated(client, auth_headers):
    await client.post("/categories", json={"name": "Raw Materials"}, headers=auth_headers)
    await client.post("/categories", json={"name": "Finished Goods"}, headers=auth_headers)

    res = await client.get("/categories", headers=auth_headers)
    assert res.status_code == 200
    names = [c["name"] for c in res.json()]
    assert "Raw Materials" in names
    assert "Finished Goods" in names

@pytest.mark.asyncio
async def test_create_category_empty_name_fails(client, auth_headers):
    res = await client.post(
        "/categories",
        json={"name": ""},
        headers=auth_headers,
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_category_rbac_staff_cannot_create(client, staff_auth_headers):
    res = await client.post(
        "/categories",
        json={"name": "Forbidden Category"},
        headers=staff_auth_headers,
    )
    assert res.status_code == 403

@pytest.mark.asyncio
async def test_category_unauthenticated_fails(client):
    res = await client.get("/categories")
    assert res.status_code in (401, 403)
