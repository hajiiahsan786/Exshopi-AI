import pytest
from app.services.ai_service import AIService

def test_ai_service_provider(db):
    data = {"name": "Test Service Provider"}
    provider = AIService.create_provider(db, data, user_id=1)

    assert provider.id is not None
    assert provider.name == "Test Service Provider"

    providers = AIService.get_providers(db)
    assert len(providers) > 0
    assert any(p.id == provider.id for p in providers)
