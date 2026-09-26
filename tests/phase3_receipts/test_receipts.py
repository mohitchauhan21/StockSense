import pytest
from sqlalchemy import select
from app.models.stock import StockLevel
from app.models.ledger import StockLedger, MovementType

@pytest.mark.asyncio
async def test_create_receipt_draft(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Acme Corp",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["supplier_name"] == "Acme Corp"
    assert data["status"] == "draft"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 100.0

@pytest.mark.asyncio
async def test_create_receipt_empty_items_rejected(client, auth_headers):
    res = await client.post(
        "/receipts",
        json={"supplier_name": "Acme Corp", "items": []},
        headers=auth_headers,
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_create_receipt_non_existent_product(client, auth_headers, make_location):
    location = await make_location()
    res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Acme Corp",
            "items": [{"product_id": 99999, "location_id": location.id, "quantity": 10.0}],
        },
        headers=auth_headers,
    )
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_create_receipt_zero_or_negative_quantity(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    res_zero = await client.post(
        "/receipts",
        json={
            "supplier_name": "Acme Corp",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 0.0}],
        },
        headers=auth_headers,
    )
    assert res_zero.status_code == 422

    res_neg = await client.post(
        "/receipts",
        json={
            "supplier_name": "Acme Corp",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": -5.0}],
        },
        headers=auth_headers,
    )
    assert res_neg.status_code == 422

@pytest.mark.asyncio
async def test_validate_receipt_increments_stock_and_ledger(client, auth_headers, make_product, make_location, db_session):
    product = await make_product()
    location = await make_location()

    create_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Steel Supply Co",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    receipt_id = create_res.json()["id"]

    val_res = await client.post(f"/receipts/{receipt_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["status"] == "done"
    assert val_data["validated_at"] is not None

    # Check product stock by location via API
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    stock_by_loc = prod_res.json()["stock_by_location"]
    assert len(stock_by_loc) == 1
    assert stock_by_loc[0]["quantity"] == 100.0

    # Check ledger row directly via DB query
    ledger_stmt = select(StockLedger).where(StockLedger.reference_table == "receipts", StockLedger.reference_id == receipt_id)
    ledger_res = await db_session.execute(ledger_stmt)
    ledger_rows = ledger_res.scalars().all()
    assert len(ledger_rows) == 1
    assert ledger_rows[0].change_qty == 100.0
    assert ledger_rows[0].balance_after == 100.0
    assert ledger_rows[0].movement_type == MovementType.receipt

@pytest.mark.asyncio
async def test_validate_already_done_receipt_fails(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    create_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )
    receipt_id = create_res.json()["id"]

    await client.post(f"/receipts/{receipt_id}/validate", headers=auth_headers)

    # Second attempt returns 409
    second_res = await client.post(f"/receipts/{receipt_id}/validate", headers=auth_headers)
    assert second_res.status_code == 409

    # Verify stock was not double-incremented
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 50.0

@pytest.mark.asyncio
async def test_edit_done_receipt_fails(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    create_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )
    receipt_id = create_res.json()["id"]
    await client.post(f"/receipts/{receipt_id}/validate", headers=auth_headers)

    edit_res = await client.put(
        f"/receipts/{receipt_id}",
        json={"supplier_name": "New Supplier Name"},
        headers=auth_headers,
    )
    assert edit_res.status_code == 409

@pytest.mark.asyncio
async def test_cancel_receipt_draft_vs_done(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    # Cancel draft receipt
    draft_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    draft_id = draft_res.json()["id"]

    cancel_res = await client.post(f"/receipts/{draft_id}/cancel", headers=auth_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "canceled"

    # Cancel done receipt returns 409
    done_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    done_id = done_res.json()["id"]
    await client.post(f"/receipts/{done_id}/validate", headers=auth_headers)

    cancel_done_res = await client.post(f"/receipts/{done_id}/cancel", headers=auth_headers)
    assert cancel_done_res.status_code == 409

@pytest.mark.asyncio
async def test_validate_receipt_multiple_items_different_locations(client, auth_headers, make_product, make_location):
    product = await make_product()
    loc1 = await make_location()
    loc2 = await make_location()

    create_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Multi Location Supplier",
            "items": [
                {"product_id": product.id, "location_id": loc1.id, "quantity": 30.0},
                {"product_id": product.id, "location_id": loc2.id, "quantity": 70.0},
            ],
        },
        headers=auth_headers,
    )
    receipt_id = create_res.json()["id"]

    val_res = await client.post(f"/receipts/{receipt_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200

    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    stock_by_loc = {item["location_id"]: item["quantity"] for item in prod_res.json()["stock_by_location"]}
    assert stock_by_loc[loc1.id] == 30.0
    assert stock_by_loc[loc2.id] == 70.0

@pytest.mark.asyncio
async def test_list_receipts_filtering(client, auth_headers, make_product, make_location, make_warehouse):
    wh = await make_warehouse()
    loc = await make_location(warehouse_id=wh.id)
    product = await make_product()

    # Draft receipt
    r1 = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier 1",
            "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 10.0}],
        },
        headers=auth_headers,
    )
    r1_id = r1.json()["id"]

    # Done receipt
    r2 = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier 2",
            "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    r2_id = r2.json()["id"]
    await client.post(f"/receipts/{r2_id}/validate", headers=auth_headers)

    # Filter by status=draft
    res_draft = await client.get("/receipts?status=draft", headers=auth_headers)
    assert res_draft.status_code == 200
    ids_draft = [r["id"] for r in res_draft.json()["items"]]
    assert r1_id in ids_draft
    assert r2_id not in ids_draft

    # Filter by warehouse_id
    res_wh = await client.get(f"/receipts?warehouse_id={wh.id}", headers=auth_headers)
    assert res_wh.status_code == 200
    assert res_wh.json()["total_count"] == 2
