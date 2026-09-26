import asyncio
import pytest
from sqlalchemy import select
from app.models.stock import StockLevel
from app.models.ledger import StockLedger, MovementType

@pytest.mark.asyncio
async def test_validate_delivery_sufficient_stock(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    # Receive initial stock of 100 via receipt validate
    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    rec_id = rec_res.json()["id"]
    await client.post(f"/receipts/{rec_id}/validate", headers=auth_headers)

    # Create delivery for 40
    del_res = await client.post(
        "/deliveries",
        json={
            "customer_name": "Client A",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 40.0}],
        },
        headers=auth_headers,
    )
    del_id = del_res.json()["id"]

    # Validate delivery
    val_res = await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)
    assert val_res.status_code == 200
    assert val_res.json()["status"] == "done"

    # Verify stock decremented to 60
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 60.0

@pytest.mark.asyncio
async def test_validate_delivery_insufficient_stock_single_item(client, auth_headers, make_product, make_location):
    p1 = await make_product()
    p2 = await make_product()
    location = await make_location()

    # Receive 100 of p1, but 0 of p2
    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": p1.id, "location_id": location.id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec_res.json()['id']}/validate", headers=auth_headers)

    # Delivery requests 50 of p1 (sufficient) and 10 of p2 (insufficient: 0 available)
    del_res = await client.post(
        "/deliveries",
        json={
            "customer_name": "Client B",
            "items": [
                {"product_id": p1.id, "location_id": location.id, "quantity": 50.0},
                {"product_id": p2.id, "location_id": location.id, "quantity": 10.0},
            ],
        },
        headers=auth_headers,
    )
    del_id = del_res.json()["id"]

    val_res = await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)
    assert val_res.status_code == 422
    data = val_res.json()
    assert data["success"] is False
    assert len(data["errors"]) == 1
    assert data["errors"][0]["product_id"] == p2.id
    assert data["errors"][0]["requested"] == 10.0
    assert data["errors"][0]["available"] == 0.0

    # Ensure p1 stock remains 100 (all-or-nothing, no partial decrement)
    prod_res = await client.get(f"/products/{p1.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 100.0

@pytest.mark.asyncio
async def test_validate_delivery_insufficient_stock_multiple_items(client, auth_headers, make_product, make_location):
    p1 = await make_product()
    p2 = await make_product()
    location = await make_location()

    # Receive 30 of p1, 0 of p2
    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": p1.id, "location_id": location.id, "quantity": 30.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec_res.json()['id']}/validate", headers=auth_headers)

    # Request 50 of p1 (avail 30) and 10 of p2 (avail 0)
    del_res = await client.post(
        "/deliveries",
        json={
            "customer_name": "Client C",
            "items": [
                {"product_id": p1.id, "location_id": location.id, "quantity": 50.0},
                {"product_id": p2.id, "location_id": location.id, "quantity": 10.0},
            ],
        },
        headers=auth_headers,
    )
    del_id = del_res.json()["id"]

    val_res = await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)
    assert val_res.status_code == 422
    data = val_res.json()
    assert len(data["errors"]) == 2
    failed_pids = [err["product_id"] for err in data["errors"]]
    assert p1.id in failed_pids
    assert p2.id in failed_pids

@pytest.mark.asyncio
async def test_validate_already_done_delivery_fails(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec_res.json()['id']}/validate", headers=auth_headers)

    del_res = await client.post(
        "/deliveries",
        json={
            "customer_name": "Client D",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    del_id = del_res.json()["id"]

    await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)

    # Second attempt returns 409
    second_res = await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)
    assert second_res.status_code == 409

@pytest.mark.asyncio
async def test_concurrent_delivery_validations_prevent_negative_stock(client, auth_headers, make_product, make_location):
    product = await make_product()
    location = await make_location()

    # Initial stock = 50
    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": product.id, "location_id": location.id, "quantity": 50.0}],
        },
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec_res.json()['id']}/validate", headers=auth_headers)

    # Two delivery orders, each requesting 40 (total 80 > 50 available)
    d1 = await client.post(
        "/deliveries",
        json={"customer_name": "A", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 40.0}]},
        headers=auth_headers,
    )
    d2 = await client.post(
        "/deliveries",
        json={"customer_name": "B", "items": [{"product_id": product.id, "location_id": location.id, "quantity": 40.0}]},
        headers=auth_headers,
    )

    d1_id = d1.json()["id"]
    d2_id = d2.json()["id"]

    # Execute both validation requests concurrently
    res1, res2 = await asyncio.gather(
        client.post(f"/deliveries/{d1_id}/validate", headers=auth_headers),
        client.post(f"/deliveries/{d2_id}/validate", headers=auth_headers),
        return_exceptions=True,
    )

    statuses = [res1.status_code, res2.status_code]
    # Exactly one must succeed (200) and one must fail (422)
    assert 200 in statuses
    assert 422 in statuses

    # Stock must equal 10.0 (50 - 40), never negative
    prod_res = await client.get(f"/products/{product.id}", headers=auth_headers)
    assert prod_res.json()["stock_by_location"][0]["quantity"] == 10.0
