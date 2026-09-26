import pytest
from decimal import Decimal
from app.models.stock import StockLevel

@pytest.mark.asyncio
async def test_ledger_listing_and_filtering(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    # 1. Receipt +100
    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 100.0}]},
        headers=auth_headers,
    )
    rec_id = rec.json()["id"]
    await client.post(f"/receipts/{rec_id}/validate", headers=auth_headers)

    # 2. Delivery -30
    deliv = await client.post(
        "/deliveries",
        json={"customer_name": "Cust", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 30.0}]},
        headers=auth_headers,
    )
    deliv_id = deliv.json()["id"]
    await client.post(f"/deliveries/{deliv_id}/validate", headers=auth_headers)

    # List ledger for product
    res = await client.get(f"/ledger?product_id={product.id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 2
    # Newest first
    assert data["items"][0]["movement_type"] == "delivery"
    assert data["items"][0]["change_qty"] == -30.0
    assert data["items"][1]["movement_type"] == "receipt"
    assert data["items"][1]["change_qty"] == 100.0

    # Filter by movement_type=receipt
    res_type = await client.get(f"/ledger?movement_type=receipt", headers=auth_headers)
    assert res_type.json()["items"][0]["reference_id"] == rec_id

@pytest.mark.asyncio
async def test_ledger_balance_check_consistent(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 75.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    bal_res = await client.get(f"/ledger/product/{product.id}/balance", headers=auth_headers)
    assert bal_res.status_code == 200
    data = bal_res.json()
    assert data["product_id"] == product.id
    assert data["overall_consistent"] is True
    assert len(data["locations"]) == 1
    assert data["locations"][0]["stock_level_qty"] == 75.0
    assert data["locations"][0]["ledger_sum_qty"] == 75.0
    assert data["locations"][0]["is_consistent"] is True

@pytest.mark.asyncio
async def test_ledger_balance_check_flags_mismatch(client, auth_headers, make_product, make_location, db_session):
    product = await make_product()
    location = await make_location()

    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Deliberately mutate stock_level directly without ledger entry to simulate corruption
    sl_res = await db_session.execute(
        StockLevel.__table__.select().where(
            StockLevel.product_id == product.id,
            StockLevel.location_id == location.id,
        )
    )
    row_id = sl_res.first()[0]
    await db_session.execute(
        StockLevel.__table__.update().where(StockLevel.id == row_id).values(quantity=Decimal("99.0"))
    )
    await db_session.commit()

    # Balance check must catch corruption
    bal_res = await client.get(f"/ledger/product/{product.id}/balance", headers=auth_headers)
    assert bal_res.status_code == 200
    data = bal_res.json()
    assert data["overall_consistent"] is False
    assert data["locations"][0]["is_consistent"] is False
    assert data["locations"][0]["stock_level_qty"] == 99.0
    assert data["locations"][0]["ledger_sum_qty"] == 50.0
