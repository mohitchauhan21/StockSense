import pytest
from sqlalchemy import select
from app.models.stock import StockLevel
from app.models.ledger import StockLedger, MovementType

@pytest.mark.asyncio
async def test_create_product_valid_data(client, auth_headers):
    res = await client.post(
        "/products",
        json={
            "name": "Steel Rods",
            "sku": "STL-001",
            "unit_of_measure": "kg",
            "reorder_point": 20.0,
            "reorder_qty": 100.0,
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Steel Rods"
    assert data["sku"] == "STL-001"

@pytest.mark.asyncio
async def test_create_product_duplicate_sku(client, auth_headers):
    await client.post(
        "/products",
        json={"name": "P1", "sku": "DUP-SKU", "unit_of_measure": "unit"},
        headers=auth_headers,
    )
    res = await client.post(
        "/products",
        json={"name": "P2", "sku": "DUP-SKU", "unit_of_measure": "unit"},
        headers=auth_headers,
    )
    assert res.status_code == 409

@pytest.mark.asyncio
async def test_create_product_negative_reorder_point(client, auth_headers):
    res = await client.post(
        "/products",
        json={"name": "Bad Product", "sku": "BAD-001", "unit_of_measure": "unit", "reorder_point": -5.0},
        headers=auth_headers,
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_create_product_with_initial_stock(client, auth_headers, make_location, db_session):
    loc1 = await make_location(name="Rack 1")
    loc2 = await make_location(name="Rack 2")

    res = await client.post(
        "/products",
        json={
            "name": "Copper Pipe",
            "sku": "COP-001",
            "unit_of_measure": "m",
            "reorder_point": 10.0,
            "reorder_qty": 50.0,
            "initial_stock": [
                {"location_id": loc1.id, "quantity": 25.0},
                {"location_id": loc2.id, "quantity": 15.0},
            ],
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    product_id = res.json()["id"]

    # Verify stock_levels created
    stock_stmt = select(StockLevel).where(StockLevel.product_id == product_id)
    stock_res = await db_session.execute(stock_stmt)
    stock_rows = stock_res.scalars().all()
    assert len(stock_rows) == 2

    # Verify stock_ledger entries created with adjustment type
    ledger_stmt = select(StockLedger).where(StockLedger.product_id == product_id)
    ledger_res = await db_session.execute(ledger_stmt)
    ledger_rows = ledger_res.scalars().all()
    assert len(ledger_rows) == 2
    for entry in ledger_rows:
        assert entry.movement_type == MovementType.adjustment
        assert entry.reference_table == "products"

@pytest.mark.asyncio
async def test_list_products_category_filter(client, auth_headers, make_category):
    cat1 = await make_category(name="Metal")
    cat2 = await make_category(name="Plastic")

    await client.post(
        "/products",
        json={"name": "Iron Plate", "sku": "IRN-001", "unit_of_measure": "kg", "category_id": cat1.id},
        headers=auth_headers,
    )
    await client.post(
        "/products",
        json={"name": "PVC Tube", "sku": "PVC-001", "unit_of_measure": "m", "category_id": cat2.id},
        headers=auth_headers,
    )

    res = await client.get(f"/products?category_id={cat1.id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 1
    assert data["items"][0]["sku"] == "IRN-001"

@pytest.mark.asyncio
async def test_list_products_search_name_and_sku(client, auth_headers):
    await client.post(
        "/products",
        json={"name": "Aluminum Sheet", "sku": "ALU-100", "unit_of_measure": "sqm"},
        headers=auth_headers,
    )
    await client.post(
        "/products",
        json={"name": "Brass Bolt", "sku": "BRS-200", "unit_of_measure": "unit"},
        headers=auth_headers,
    )

    # Search by partial name
    res_name = await client.get("/products?search=alumi", headers=auth_headers)
    assert res_name.json()["total_count"] == 1
    assert res_name.json()["items"][0]["sku"] == "ALU-100"

    # Search by partial SKU case-insensitive
    res_sku = await client.get("/products?search=brs-2", headers=auth_headers)
    assert res_sku.json()["total_count"] == 1
    assert res_sku.json()["items"][0]["name"] == "Brass Bolt"

@pytest.mark.asyncio
async def test_list_products_low_stock_only(client, auth_headers, make_location):
    loc = await make_location()

    # Product 1: High stock (50 > reorder 20)
    await client.post(
        "/products",
        json={
            "name": "High Stock Item",
            "sku": "HIGH-01",
            "unit_of_measure": "unit",
            "reorder_point": 20.0,
            "initial_stock": [{"location_id": loc.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )

    # Product 2: Low stock (5 <= reorder 20)
    await client.post(
        "/products",
        json={
            "name": "Low Stock Item",
            "sku": "LOW-01",
            "unit_of_measure": "unit",
            "reorder_point": 20.0,
            "initial_stock": [{"location_id": loc.id, "quantity": 5.0}],
        },
        headers=auth_headers,
    )

    res = await client.get("/products?low_stock_only=true", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 1
    assert data["items"][0]["sku"] == "LOW-01"

@pytest.mark.asyncio
async def test_update_product_cannot_change_sku(client, auth_headers):
    create_res = await client.post(
        "/products",
        json={"name": "Original Name", "sku": "SKU-FIXED", "unit_of_measure": "unit"},
        headers=auth_headers,
    )
    product_id = create_res.json()["id"]

    res = await client.put(
        f"/products/{product_id}",
        json={"name": "New Name", "sku": "SKU-CHANGED"},
        headers=auth_headers,
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_delete_product_with_ledger_history_fails(client, auth_headers, make_location):
    loc = await make_location()
    create_res = await client.post(
        "/products",
        json={
            "name": "Hist Item",
            "sku": "HIST-01",
            "unit_of_measure": "unit",
            "initial_stock": [{"location_id": loc.id, "quantity": 10.0}],
        },
        headers=auth_headers,
    )
    product_id = create_res.json()["id"]

    delete_res = await client.delete(f"/products/{product_id}", headers=auth_headers)
    assert delete_res.status_code == 409

@pytest.mark.asyncio
async def test_delete_product_no_history_soft_deletes(client, auth_headers):
    create_res = await client.post(
        "/products",
        json={"name": "No Hist Item", "sku": "NOHIST-01", "unit_of_measure": "unit"},
        headers=auth_headers,
    )
    product_id = create_res.json()["id"]

    delete_res = await client.delete(f"/products/{product_id}", headers=auth_headers)
    assert delete_res.status_code == 204

    # Default list excludes soft-deleted product
    list_res = await client.get("/products", headers=auth_headers)
    skus = [p["sku"] for p in list_res.json()["items"]]
    assert "NOHIST-01" not in skus

@pytest.mark.asyncio
async def test_location_duplicate_name_same_warehouse(client, auth_headers, make_warehouse):
    wh = await make_warehouse()
    await client.post(
        "/locations",
        json={"warehouse_id": wh.id, "name": "Bin 1"},
        headers=auth_headers,
    )
    dup_res = await client.post(
        "/locations",
        json={"warehouse_id": wh.id, "name": "Bin 1"},
        headers=auth_headers,
    )
    assert dup_res.status_code == 409

@pytest.mark.asyncio
async def test_location_same_name_different_warehouse(client, auth_headers, make_warehouse):
    wh1 = await make_warehouse(name="WH 1")
    wh2 = await make_warehouse(name="WH 2")

    res1 = await client.post(
        "/locations",
        json={"warehouse_id": wh1.id, "name": "Bin A"},
        headers=auth_headers,
    )
    assert res1.status_code == 201

    res2 = await client.post(
        "/locations",
        json={"warehouse_id": wh2.id, "name": "Bin A"},
        headers=auth_headers,
    )
    assert res2.status_code == 201

@pytest.mark.asyncio
async def test_delete_warehouse_with_non_zero_stock_fails(client, auth_headers, make_warehouse, make_location):
    wh = await make_warehouse(name="Stocked WH")
    loc = await make_location(name="Rack X", warehouse_id=wh.id)

    # Create product with initial stock at this warehouse location
    await client.post(
        "/products",
        json={
            "name": "Stocked Item",
            "sku": "STK-WH-01",
            "unit_of_measure": "unit",
            "initial_stock": [{"location_id": loc.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )

    del_res = await client.delete(f"/warehouses/{wh.id}", headers=auth_headers)
    assert del_res.status_code == 409
