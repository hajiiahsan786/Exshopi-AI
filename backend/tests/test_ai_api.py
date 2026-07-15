import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.dependencies import get_db
from app.api.v1.endpoints.auth import get_current_active_user
from app.models.user import User

client = TestClient(app)

def override_get_current_user():
    user = User(id=1, email="test@example.com", is_active=True)
    return user

app.dependency_overrides[get_current_active_user] = override_get_current_user

def test_create_and_get_provider(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    response = client.post("/api/v1/ai/providers", json={"name": "Test API Provider"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["name"] == "Test API Provider"

    response_get = client.get("/api/v1/ai/providers")
    assert response_get.status_code == 200
    providers = response_get.json()
    assert len(providers) > 0
    assert any(p["name"] == "Test API Provider" for p in providers)
