import pytest
from app.models.marketing import MarketingCampaign
from app.schemas.marketing import MarketingCampaignCreate

def test_marketing_campaign_model():
    campaign = MarketingCampaign(name="Summer Sale", organization_id=1, status="active")
    assert campaign.name == "Summer Sale"
    assert campaign.organization_id == 1
    assert campaign.status == "active"

def test_marketing_campaign_create_schema():
    schema = MarketingCampaignCreate(name="Winter Sale", organization_id=2)
    assert schema.name == "Winter Sale"
    assert schema.organization_id == 2

from unittest.mock import Mock
from app.services.marketing_service import MarketingCampaignService
from sqlalchemy.orm import Session

def test_campaign_lifecycle():
    # Mocking a db session
    db = Mock(spec=Session)

    # Create the service with a dummy repo
    repo = Mock()
    service = MarketingCampaignService()
    service.repository = repo

    # Mock the get behavior to return a campaign
    campaign = MarketingCampaign(name="Test", organization_id=1, status="draft")
    repo.get.return_value = campaign

    # Start campaign
    active_campaign = service.start_campaign(db, 1)
    assert active_campaign.status == "active"

    # Pause campaign
    paused_campaign = service.pause_campaign(db, 1)
    assert paused_campaign.status == "paused"

    # End campaign
    completed_campaign = service.end_campaign(db, 1)
    assert completed_campaign.status == "completed"
