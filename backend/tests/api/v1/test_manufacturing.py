import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_manufacturing_orders_router_exists():
    # Since we are not doing a full DB mock setup for API tests,
    # we just check if the router is successfully registered and returns a 401/403 or DB error instead of 404
    response = client.get("/api/v1/manufacturing/orders")

    # Normally this would be a 401 Unauthorized since we are not passing a token,
    # or a 500 DB error if the dependency triggers before auth.
    # The key is it should NOT be 404 Not Found.
    assert response.status_code != 404

def test_boms_router_exists():
    response = client.get("/api/v1/manufacturing/boms")
    assert response.status_code != 404
