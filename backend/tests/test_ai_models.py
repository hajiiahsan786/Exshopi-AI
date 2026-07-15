import pytest
from app.models.ai import AIProvider

def test_ai_provider_creation(db):
    provider = AIProvider(name="Test Provider", description="Test Description", is_active=True)
    db.add(provider)
    db.commit()
    db.refresh(provider)
    assert provider.id is not None
    assert provider.name == "Test Provider"
