import pytest
from sqlalchemy import select
from app.models.ledger import StockLedger, MovementType

@pytest.mark.asyncio
async def test_create_transfer_same_location_rejected(client, auth_headers, make_product, make_location):
    product = await make_product()
    loc = await make_location()

    res = await client.post(
        "/transfers",
        json={
            "product_id": product.id,
            "from_location_id": loc.id,
            "to_location_id": loc.id,
            "quantity": 10.0,
        },
        headers=auth_headers,
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_validate_transfer_sufficient_stock(client, auth_headers, make_product, make_location, db_session):
    product = await make_product()
    loc_from = await make_location()
    loc_to = await make_location()

    # Receive 100 at source location
    rec = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": loc_from.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Transfer 40 from loc_from to loc_to
    tr_res = await client.post(
        "/transfers",
        json={
            "product_id": product.id,
            "from_location_id": loc_from.id,
            "to_location_id": loc_to.id,
            "quantity": 40.0,
        },
        headers=auth_headers,
    )
    transfer_id = tr_res.json()["id"]

    val_res = await client.post(f"/transfers/{transfer_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200
    assert val_res.json()["status"] == "done"

    # Check quantities by location
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    stock_map = {item["location_id"]: item["quantity"] for item in prod_res.json()["stock_by_location"]}
    assert stock_map[loc_from.id] == 60.0
    assert stock_map[loc_to.id] == 40.0
    # Total stock across company is unchanged (100)
    assert sum(stock_map.values()) == 100.0

    # Verify exactly two paired ledger entries with same reference_id
    stmt = select(StockLedger).where(
        StockLedger.reference_table == "internal_transfers",
        StockLedger.reference_id == transfer_id,
    )
    ledger_res = await db_session.execute(stmt)
    rows = ledger_res.scalars().all()
    assert len(rows) == 2
    movements = {r.movement_type: r.change_qty for r in rows}
    assert movements[MovementType.transfer_out] == -40.0
    assert movements[MovementType.transfer_in] == 40.0

@pytest.mark.asyncio
async def test_validate_transfer_insufficient_stock(client, auth_headers, make_product, make_location):
    product = await make_product()
    loc_from = await make_location()
    loc_to = await make_location()

    # Receive 20 at source location
    rec = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": loc_from.id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Attempt to transfer 50 (avail = 20)
    tr_res = await client.post(
        "/transfers",
        json={
            "product_id": product.id,
            "from_location_id": loc_from.id,
            "to_location_id": loc_to.id,
            "quantity": 50.0,
        },
        headers=auth_headers,
    )
    transfer_id = tr_res.json()["id"]

    val_res = await client.post(f"/transfers/{transfer_id}/validate", headers=auth_headers)
    assert val_res.status_code == 422

    # Verify neither location was mutated
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    stock_map = {item["location_id"]: item["quantity"] for item in prod_res.json()["stock_by_location"]}
    assert stock_map[loc_from.id] == 20.0
    assert loc_to.id not in stock_map or stock_map[loc_to.id] == 0.0
