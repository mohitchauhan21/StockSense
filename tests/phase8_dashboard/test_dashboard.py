import pytest

@pytest.mark.asyncio
async def test_dashboard_summary_kpis(client, auth_headers, make_product, make_location):
    loc = await make_location()

    # Product 1: In stock (50 > reorder 20) -> Normal stock
    p1 = await make_product(reorder_point=20.0)
    rec1 = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": p1.id, "location_id": loc.id, "quantity": 50.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec1.json()['id']}/validate", headers=auth_headers)

    # Product 2: Low stock (15 <= reorder 20)
    p2 = await make_product(reorder_point=20.0)
    rec2 = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": p2.id, "location_id": loc.id, "quantity": 15.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec2.json()['id']}/validate", headers=auth_headers)

    # Product 3: Out of stock (0 stock)
    p3 = await make_product(reorder_point=10.0)

    # Pending Receipt (draft)
    await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": p1.id, "location_id": loc.id, "quantity": 10.0}]},
        headers=auth_headers,
    )

    # Get Dashboard Summary
    res = await client.get("/dashboard/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_products_in_stock"] == 2
    assert data["low_stock_count"] == 1
    assert data["out_of_stock_count"] == 1
    assert data["pending_receipts"] == 1

@pytest.mark.asyncio
async def test_dashboard_low_stock_updates_live_on_delivery(client, auth_headers, make_product, make_location):
    loc = await make_location()
    product = await make_product(reorder_point=20.0)

    # Initial stock = 30 (> 20 reorder point)
    rec = await client.post(
        "/receipts",
        json={"supplier_name": "Sup", "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 30.0}]},
        headers=auth_headers,
    )
    await client.post(f"/receipts/{rec.json()['id']}/validate", headers=auth_headers)

    # Check low stock count = 0 initially
    summary1 = (await client.get("/dashboard/summary", headers=auth_headers)).json()
    assert summary1["low_stock_count"] == 0

    # Delivery of 15 pushes stock to 15 (<= 20 reorder point)
    deliv = await client.post(
        "/deliveries",
        json={"customer_name": "Cust", "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 15.0}]},
        headers=auth_headers,
    )
    await client.post(f"/deliveries/{deliv.json()['id']}/validate", headers=auth_headers)

    # Low stock count updates live to 1
    summary2 = (await client.get("/dashboard/summary", headers=auth_headers)).json()
    assert summary2["low_stock_count"] == 1

@pytest.mark.asyncio
async def test_dashboard_unified_documents(client, auth_headers, make_product, make_location):
    product = await make_product()
    loc = await make_location()

    # 1. Receipt
    r = await client.post(
        "/receipts",
        json={"supplier_name": "Acme Steel", "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 100.0}]},
        headers=auth_headers,
    )
    r_id = r.json()["id"]

    # 2. Delivery
    d = await client.post(
        "/deliveries",
        json={"customer_name": "Global Tech", "items": [{"product_id": product.id, "location_id": loc.id, "quantity": 20.0}]},
        headers=auth_headers,
    )
    d_id = d.json()["id"]

    # Query all unified documents
    res_all = await client.get("/dashboard/documents", headers=auth_headers)
    assert res_all.status_code == 200
    all_data = res_all.json()
    assert all_data["total_count"] >= 2

    # Query filtered by document_type=receipt
    res_rec = await client.get("/dashboard/documents?document_type=receipt", headers=auth_headers)
    assert res_rec.status_code == 200
    rec_items = res_rec.json()["items"]
    assert any(item["id"] == r_id and item["document_type"] == "receipt" for item in rec_items)

    # Query filtered by document_type=delivery
    res_del = await client.get("/dashboard/documents?document_type=delivery", headers=auth_headers)
    assert res_del.status_code == 200
    del_items = res_del.json()["items"]
    assert any(item["id"] == d_id and item["document_type"] == "delivery" for item in del_items)
