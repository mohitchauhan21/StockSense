import pytest
from sqlalchemy import select
from app.models.ledger import StockLedger, MovementType

@pytest.mark.asyncio
async def test_adjustment_decrease_stock(client, auth_headers, make_product, make_location, db_session):
    product = await make_product()
    location = await make_location()

    # Receive 100
    rec = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Adjustment count = 97 (3 damaged)
    adj_res = await client.post(
        "/adjustments",
        json={
            "product_id": product.id,
            "location_id": location.id,
            "counted_qty": 97.0,
            "reason": "3 units damaged in rack",
        },
        headers=auth_headers,
    )
    assert adj_res.status_code == 201
    adj_data = adj_res.json()
    assert adj_data["system_qty"] == 100.0
    assert adj_data["counted_qty"] == 97.0
    assert adj_data["difference"] == -3.0

    # Stock levels decremented to 97
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 97.0

    # Ledger entry change_qty = -3.0
    stmt = select(StockLedger).where(
        StockLedger.reference_table == "stock_adjustments",
        StockLedger.reference_id == adj_data["id"],
    )
    ledger_res = await db_session.execute(stmt)
    entry = ledger_res.scalar_one()
    assert entry.change_qty == -3.0
    assert entry.balance_after == 97.0
    assert entry.movement_type == MovementType.adjustment

@pytest.mark.asyncio
async def test_adjustment_increase_stock(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    # Receive 50
    rec = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Adjustment count = 55 (found extra items)
    adj_res = await client.post(
        "/adjustments",
        json={
            "product_id": product.id,
            "location_id": location.id,
            "counted_qty": 55.0,
            "reason": "Found 5 unrecorded units",
        },
        headers=auth_headers,
    )
    assert adj_res.status_code == 201
    adj_data = adj_res.json()
    assert adj_data["system_qty"] == 50.0
    assert adj_data["counted_qty"] == 55.0
    assert adj_data["difference"] == 5.0

    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 55.0

@pytest.mark.asyncio
async def test_adjustment_equal_qty_zero_difference(client, auth_headers, make_product, make_location, db_session):
    product = await make_product()
    location = await make_location()

    rec = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 30.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Adjustment count = 30 (exact match)
    adj_res = await client.post(
        "/adjustments",
        json={
            "product_id": product.id,
            "location_id": location.id,
            "counted_qty": 30.0,
            "reason": "Routine inventory audit",
        },
        headers=auth_headers,
    )
    assert adj_res.status_code == 201
    adj_data = adj_res.json()
    assert adj_data["difference"] == 0.0

    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 30.0

    # Ledger entry recorded with change_qty = 0
    stmt = select(StockLedger).where(
        StockLedger.reference_table == "stock_adjustments",
        StockLedger.reference_id == adj_data["id"],
    )
    ledger_res = await db_session.execute(stmt)
    entry = ledger_res.scalar_one()
    assert entry.change_qty == 0.0
    assert entry.balance_after == 30.0
