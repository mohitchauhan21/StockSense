import pytest

@pytest.mark.asyncio
async def test_health_check_endpoint(client):
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

@pytest.mark.asyncio
async def test_non_existent_route_returns_404(client):
    res = await client.get("/api/v1/does-not-exist")
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_validation_error_handler_response_structure(client, auth_headers):
    # Sending invalid data type for quantity (string instead of float)
    res = await client.post(
        "/receipts",
        json={
            "supplier_name": "Supplier",
            "items": [{"product_id": 1, "location_id": 1, "quantity": "invalid_number"}],
        },
        headers=auth_headers,
    )
    assert res.status_code == 422
    data = res.json()
    assert "error" in data or "detail" in data
