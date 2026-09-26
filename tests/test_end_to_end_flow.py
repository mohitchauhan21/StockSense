import pytest

@pytest.mark.asyncio
async def test_end_to_end_worked_example(client, auth_headers):
    # Step 1: Create product "Steel Rods", unit kg, reorder_point 20
    p_res = await client.post(
        "/products",
        json={
            "name": "Steel Rods",
            "sku": "STEEL-ROD-01",
            "unit_of_measure": "kg",
            "reorder_point": 20.0,
            "reorder_qty": 50.0,
        },
        headers=auth_headers,
    )
    assert p_res.status_code == 201
    product_id = p_res.json()["id"]

    # Step 2: Create warehouse "Main Store" with locations "Main Store" and "Production Rack"
    wh_res = await client.post(
        "/warehouses",
        json={"name": "Main Store Warehouse", "address": "100 Industrial Way"},
        headers=auth_headers,
    )
    assert wh_res.status_code == 201
    warehouse_id = wh_res.json()["id"]

    loc1_res = await client.post(
        "/locations",
        json={"warehouse_id": warehouse_id, "name": "Main Store Location"},
        headers=auth_headers,
    )
    assert loc1_res.status_code == 201
    loc1_id = loc1_res.json()["id"]

    loc2_res = await client.post(
        "/locations",
        json={"warehouse_id": warehouse_id, "name": "Production Rack"},
        headers=auth_headers,
    )
    assert loc2_res.status_code == 201
    loc2_id = loc2_res.json()["id"]

    # Step 3: Receive 100 kg at "Main Store Location" -> assert stock is 100
    rec_res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Apex Steel Co",
            "items": [{"product_id": product_id, "location_id": loc1_id, "quantity": 100.0}],
        },
        headers=auth_headers,
    )
    assert rec_res.status_code == 201
    rec_id = rec_res.json()["id"]

    val_rec = await client.post(f"/receipts/{rec_id}/validate", headers=auth_headers)
    assert val_rec.status_code == 200

    stock1 = await client.get(f"/products/{product_id}", headers=auth_headers)
    stock_map1 = {item["location_id"]: item["quantity"] for item in stock1.json()["stock_by_location"]}
    assert stock_map1[loc1_id] == 100.0

    # Step 4: Internal transfer 100 kg from "Main Store Location" to "Production Rack"
    tr_res = await client.post(
        "/transfers",
        json={
            "product_id": product_id,
            "from_location_id": loc1_id,
            "to_location_id": loc2_id,
            "quantity": 100.0,
        },
        headers=auth_headers,
    )
    assert tr_res.status_code == 201
    tr_id = tr_res.json()["id"]

    val_tr = await client.post(f"/transfers/{tr_id}/validate", headers=auth_headers)
    assert val_tr.status_code == 200

    stock2 = await client.get(f"/products/{product_id}", headers=auth_headers)
    stock_map2 = {item["location_id"]: item["quantity"] for item in stock2.json()["stock_by_location"]}
    assert stock_map2.get(loc1_id, 0.0) == 0.0
    assert stock_map2[loc2_id] == 100.0

    # Step 5: Deliver 20 kg from "Production Rack" -> assert 80 remaining
    del_res = await client.post(
        "/deliveries",
        json={
            "customer_name": "BuildCorp",
            "items": [{"product_id": product_id, "location_id": loc2_id, "quantity": 20.0}],
        },
        headers=auth_headers,
    )
    assert del_res.status_code == 201
    del_id = del_res.json()["id"]

    val_del = await client.post(f"/deliveries/{del_id}/validate", headers=auth_headers)
    assert val_del.status_code == 200

    stock3 = await client.get(f"/products/{product_id}", headers=auth_headers)
    stock_map3 = {item["location_id"]: item["quantity"] for item in stock3.json()["stock_by_location"]}
    assert stock_map3[loc2_id] == 80.0

    # Step 6: Adjustment: counted 77 kg (3 kg damaged) -> assert stock is 77 and difference = -3
    adj_res = await client.post(
        "/adjustments",
        json={
            "product_id": product_id,
            "location_id": loc2_id,
            "counted_qty": 77.0,
            "reason": "3 kg steel damaged",
        },
        headers=auth_headers,
    )
    assert adj_res.status_code == 201
    assert adj_res.json()["difference"] == -3.0

    stock4 = await client.get(f"/products/{product_id}", headers=auth_headers)
    stock_map4 = {item["location_id"]: item["quantity"] for item in stock4.json()["stock_by_location"]}
    assert stock_map4[loc2_id] == 77.0

    # Step 7: Assert GET /ledger for this product returns exactly five rows in order
    ledger_res = await client.get(f"/ledger?product_id={product_id}", headers=auth_headers)
    assert ledger_res.status_code == 200
    ledger_data = ledger_res.json()
    assert ledger_data["total_count"] == 5

    items = ledger_data["items"]
    # Newest first:
    # 0: adjustment (-3, balance 77)
    # 1: delivery (-20, balance 80)
    # 2: transfer_in (+100, balance 100)
    # 3: transfer_out (-100, balance 0)
    # 4: receipt (+100, balance 100)
    assert items[0]["movement_type"] == "adjustment"
    assert items[0]["change_qty"] == -3.0
    assert items[0]["balance_after"] == 77.0

    assert items[1]["movement_type"] == "delivery"
    assert items[1]["change_qty"] == -20.0
    assert items[1]["balance_after"] == 80.0

    # transfer_in & transfer_out pair
    transfer_movements = {items[2]["movement_type"]: items[2], items[3]["movement_type"]: items[3]}
    assert "transfer_in" in transfer_movements and "transfer_out" in transfer_movements
    assert transfer_movements["transfer_in"]["balance_after"] == 100.0
    assert transfer_movements["transfer_out"]["balance_after"] == 0.0

    assert items[4]["movement_type"] == "receipt"
    assert items[4]["change_qty"] == 100.0
    assert items[4]["balance_after"] == 100.0
