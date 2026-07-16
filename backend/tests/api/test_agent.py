import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import status
import pytest_asyncio
from app.main import app as fastapi_app

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_agent(async_client: AsyncClient, normal_user_token_headers: dict[str, str], override_get_db) -> None:
    data = {
        "name": "Test Agent",
        "description": "A test agent for the framework",
        "status": "active"
    }
    response = await async_client.post("/api/v1/agents/", headers=normal_user_token_headers, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    content = response.json()
    assert content["name"] == data["name"]
    assert "id" in content

@pytest.mark.asyncio
async def test_get_agent(async_client: AsyncClient, normal_user_token_headers: dict[str, str], override_get_db) -> None:
    # First create
    data = {"name": "Agent To Get"}
    response = await async_client.post("/api/v1/agents/", headers=normal_user_token_headers, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    agent_id = response.json()["id"]

    # Then get
    response = await async_client.get(f"/api/v1/agents/{agent_id}", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == agent_id
    assert response.json()["name"] == data["name"]

@pytest.mark.asyncio
async def test_update_agent(async_client: AsyncClient, normal_user_token_headers: dict[str, str], override_get_db) -> None:
    # First create
    data = {"name": "Agent To Update"}
    response = await async_client.post("/api/v1/agents/", headers=normal_user_token_headers, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    agent_id = response.json()["id"]

    # Then update
    update_data = {"name": "Updated Agent Name"}
    response = await async_client.put(f"/api/v1/agents/{agent_id}", headers=normal_user_token_headers, json=update_data)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == update_data["name"]

@pytest.mark.asyncio
async def test_delete_agent(async_client: AsyncClient, normal_user_token_headers: dict[str, str], override_get_db) -> None:
    # First create
    data = {"name": "Agent To Delete"}
    response = await async_client.post("/api/v1/agents/", headers=normal_user_token_headers, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    agent_id = response.json()["id"]

    # Then delete
    response = await async_client.delete(f"/api/v1/agents/{agent_id}", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_200_OK

    # Verify not found
    response = await async_client.get(f"/api/v1/agents/{agent_id}", headers=normal_user_token_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
