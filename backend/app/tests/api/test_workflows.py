from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_workflow_api_router():
    response = client.get("/")
    assert response.status_code == 200

# Basic check that the routers are mounted
def test_workflow_endpoints_exist():
    # Attempting to GET /api/v1/workflows/ without auth might be 401/403, but it should exist (not 404)
    response = client.get("/api/v1/workflows/")
    assert response.status_code != 404
