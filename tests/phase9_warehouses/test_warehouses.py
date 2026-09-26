import pytest

@pytest.mark.asyncio
async def test_list_warehouses_empty(client, auth_headers):
    res = await client.get("/warehouses", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []

@pytest.mark.asyncio
async def test_create_warehouse_success(client, auth_headers):
    res = await client.post(
        "/warehouses",
        json={"name": "Central Hub", "address": "100 Logistics Blvd"},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Central Hub"
    assert data["address"] == "100 Logistics Blvd"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_warehouse_duplicate_name_fails(client, auth_headers):
    await client.post(
        "/warehouses",
        json={"name": "East Warehouse", "address": "123 East St"},
        headers=auth_headers,
    )
    res = await client.post(
        "/warehouses",
        json={"name": "East Warehouse", "address": "456 Other St"},
        headers=auth_headers,
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_update_warehouse_success(client, auth_headers):
    create_res = await client.post(
        "/warehouses",
        json={"name": "West Depot", "address": "Original Address"},
        headers=auth_headers,
    )
    wh_id = create_res.json()["id"]

    res = await client.put(
        f"/warehouses/{wh_id}",
        json={"name": "West Depot Updated", "address": "New Address"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "West Depot Updated"
    assert data["address"] == "New Address"

@pytest.mark.asyncio
async def test_update_warehouse_duplicate_name_fails(client, auth_headers):
    await client.post(
        "/warehouses",
        json={"name": "Warehouse Alpha"},
        headers=auth_headers,
    )
    res2 = await client.post(
        "/warehouses",
        json={"name": "Warehouse Beta"},
        headers=auth_headers,
    )
    wh2_id = res2.json()["id"]

    # Try to rename Beta to Alpha
    res = await client.put(
        f"/warehouses/{wh2_id}",
        json={"name": "Warehouse Alpha"},
        headers=auth_headers,
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_update_non_existent_warehouse_fails(client, auth_headers):
    res = await client.put(
        "/warehouses/99999",
        json={"name": "Non Existent"},
        headers=auth_headers,
    )
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_delete_empty_warehouse_success(client, auth_headers):
    create_res = await client.post(
        "/warehouses",
        json={"name": "Disposable Warehouse"},
        headers=auth_headers,
    )
    wh_id = create_res.json()["id"]

    del_res = await client.delete(f"/warehouses/{wh_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify warehouse no longer exists
    list_res = await client.get("/warehouses", headers=auth_headers)
    assert not any(w["id"] == wh_id for w in list_res.json())

@pytest.mark.asyncio
async def test_delete_non_existent_warehouse_fails(client, auth_headers):
    res = await client.delete("/warehouses/99999", headers=auth_headers)
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_delete_warehouse_with_stock_fails(client, auth_headers, make_product):
    # 1. Create warehouse and location
    wh_res = await client.post(
        "/warehouses",
        json={"name": "Stocked Warehouse"},
        headers=auth_headers,
    )
    wh_id = wh_res.json()["id"]

    loc_res = await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Aisle 1"},
        headers=auth_headers,
    )
    loc_id = loc_res.json()["id"]

    # 2. Add stock via receipt
    product = await make_product()
    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Supplier", "items": [{"product_id": product.id, "location_id": loc_id, "quantity": 50.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # 3. Attempt to delete warehouse with stock -> 409 Conflict
    del_res = await client.delete(f"/warehouses/{wh_id}", headers=auth_headers)
    assert del_res.status_code == 409

@pytest.mark.asyncio
async def test_create_location_success(client, auth_headers):
    wh_res = await client.post(
        "/warehouses",
        json={"name": "South Depot"},
        headers=auth_headers,
    )
    wh_id = wh_res.json()["id"]

    loc_res = await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Zone A"},
        headers=auth_headers,
    )
    assert loc_res.status_code == 201
    data = loc_res.json()
    assert data["warehouse_id"] == wh_id
    assert data["name"] == "Zone A"
    assert data["total_stock"] == 0.0

@pytest.mark.asyncio
async def test_create_location_non_existent_warehouse_fails(client, auth_headers):
    res = await client.post(
        "/locations",
        json={"warehouse_id": 99999, "name": "Zone Orphan"},
        headers=auth_headers,
    )
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_create_location_duplicate_name_same_warehouse_fails(client, auth_headers):
    wh_res = await client.post(
        "/warehouses",
        json={"name": "North Warehouse"},
        headers=auth_headers,
    )
    wh_id = wh_res.json()["id"]

    await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Bay 1"},
        headers=auth_headers,
    )
    res = await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Bay 1"},
        headers=auth_headers,
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_list_warehouse_locations_with_stock(client, auth_headers, make_product):
    wh_res = await client.post(
        "/warehouses",
        json={"name": "Stocked Hub"},
        headers=auth_headers,
    )
    wh_id = wh_res.json()["id"]

    loc1_res = await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Shelf 1"},
        headers=auth_headers,
    )
    loc1_id = loc1_res.json()["id"]

    loc2_res = await client.post(
        "/locations",
        json={"warehouse_id": wh_id, "name": "Shelf 2"},
        headers=auth_headers,
    )
    loc2_id = loc2_res.json()["id"]

    product = await make_product()
    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Supplier", "items": [{"product_id": product.id, "location_id": loc1_id, "quantity": 42.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    res = await client.get(f"/warehouses/{wh_id}/locations", headers=auth_headers)
    assert res.status_code == 200
    locations = res.json()
    assert len(locations) == 2
    stock_map = {loc["id"]: loc["total_stock"] for loc in locations}
    assert stock_map[loc1_id] == 42.0
    assert stock_map[loc2_id] == 0.0

@pytest.mark.asyncio
async def test_list_locations_non_existent_warehouse_fails(client, auth_headers):
    res = await client.get("/warehouses/99999/locations", headers=auth_headers)
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_warehouse_rbac_staff_cannot_create_or_modify(client, staff_auth_headers):
    # Staff cannot create warehouse
    res_create = await client.post(
        "/warehouses",
        json={"name": "Unauthorized WH"},
        headers=staff_auth_headers,
    )
    assert res_create.status_code == 403

    # Staff cannot update warehouse
    res_update = await client.put(
        "/warehouses/1",
        json={"name": "Unauthorized WH"},
        headers=staff_auth_headers,
    )
    assert res_update.status_code == 403

    # Staff cannot delete warehouse
    res_delete = await client.delete(
        "/warehouses/1",
        headers=staff_auth_headers,
    )
    assert res_delete.status_code == 403

    # Staff cannot create location
    res_loc = await client.post(
        "/locations",
        json={"warehouse_id": 1, "name": "Unauthorized Loc"},
        headers=staff_auth_headers,
    )
    assert res_loc.status_code == 403
