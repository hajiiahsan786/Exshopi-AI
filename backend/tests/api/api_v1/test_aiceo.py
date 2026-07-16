import pytest
from fastapi.testclient import TestClient

def test_aiceo_chat(client: TestClient, admin_token_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/v1/aiceo/chat",
        headers=admin_token_headers,
        json={"message": "What is the company's MRR?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message_role"] == "assistant"
    assert "analyzed" in data["content"]
