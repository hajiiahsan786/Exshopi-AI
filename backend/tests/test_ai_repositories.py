import pytest
from app.repositories.ai_repository import AIProviderRepository
from app.models.ai import AIProvider

def test_ai_provider_repository(db):
    data = {"name": "Test Repo Provider", "description": "Test Repo Description"}
    provider = AIProviderRepository.create(db, data, user_id=1)

    assert provider.id is not None
    assert provider.name == "Test Repo Provider"

    fetched = AIProviderRepository.get_by_id(db, provider.id)
    assert fetched is not None
    assert fetched.name == "Test Repo Provider"
