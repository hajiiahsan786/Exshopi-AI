from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# MarketingCampaign Schemas
class MarketingCampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    roi: Optional[float] = None


class MarketingCampaignCreate(MarketingCampaignBase):
    organization_id: int

class MarketingCampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class MarketingCampaignResponse(MarketingCampaignBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignAudience Schemas
class CampaignAudienceBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignAudienceCreate(CampaignAudienceBase):
    organization_id: int

class CampaignAudienceUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignAudienceResponse(CampaignAudienceBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignSegment Schemas
class CampaignSegmentBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignSegmentCreate(CampaignSegmentBase):
    organization_id: int

class CampaignSegmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignSegmentResponse(CampaignSegmentBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignMember Schemas
class CampaignMemberBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignMemberCreate(CampaignMemberBase):
    organization_id: int

class CampaignMemberUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignMemberResponse(CampaignMemberBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignTemplate Schemas
class CampaignTemplateBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignTemplateCreate(CampaignTemplateBase):
    organization_id: int

class CampaignTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignTemplateResponse(CampaignTemplateBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# EmailTemplate Schemas
class EmailTemplateBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)
    subject: Optional[str] = None
    body_html: Optional[str] = None
    body_text: Optional[str] = None


class EmailTemplateCreate(EmailTemplateBase):
    organization_id: int

class EmailTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class EmailTemplateResponse(EmailTemplateBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# SMSCampaign Schemas
class SMSCampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class SMSCampaignCreate(SMSCampaignBase):
    organization_id: int

class SMSCampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class SMSCampaignResponse(SMSCampaignBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# WhatsAppCampaign Schemas
class WhatsAppCampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class WhatsAppCampaignCreate(WhatsAppCampaignBase):
    organization_id: int

class WhatsAppCampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class WhatsAppCampaignResponse(WhatsAppCampaignBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# PushNotificationCampaign Schemas
class PushNotificationCampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class PushNotificationCampaignCreate(PushNotificationCampaignBase):
    organization_id: int

class PushNotificationCampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class PushNotificationCampaignResponse(PushNotificationCampaignBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# SocialMediaCampaign Schemas
class SocialMediaCampaignBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class SocialMediaCampaignCreate(SocialMediaCampaignBase):
    organization_id: int

class SocialMediaCampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class SocialMediaCampaignResponse(SocialMediaCampaignBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignSchedule Schemas
class CampaignScheduleBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)
    scheduled_date: Optional[datetime] = None


class CampaignScheduleCreate(CampaignScheduleBase):
    organization_id: int

class CampaignScheduleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignScheduleResponse(CampaignScheduleBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignWorkflow Schemas
class CampaignWorkflowBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignWorkflowCreate(CampaignWorkflowBase):
    organization_id: int

class CampaignWorkflowUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignWorkflowResponse(CampaignWorkflowBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# AutomationRule Schemas
class AutomationRuleBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class AutomationRuleCreate(AutomationRuleBase):
    organization_id: int

class AutomationRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class AutomationRuleResponse(AutomationRuleBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# TriggerEvent Schemas
class TriggerEventBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class TriggerEventCreate(TriggerEventBase):
    organization_id: int

class TriggerEventUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class TriggerEventResponse(TriggerEventBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LeadScore Schemas
class LeadScoreBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)
    lead_id: Optional[int] = None
    score: int = 0


class LeadScoreCreate(LeadScoreBase):
    organization_id: int

class LeadScoreUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LeadScoreResponse(LeadScoreBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CustomerJourney Schemas
class CustomerJourneyBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CustomerJourneyCreate(CustomerJourneyBase):
    organization_id: int

class CustomerJourneyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CustomerJourneyResponse(CustomerJourneyBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LandingPage Schemas
class LandingPageBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class LandingPageCreate(LandingPageBase):
    organization_id: int

class LandingPageUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LandingPageResponse(LandingPageBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LandingPageForm Schemas
class LandingPageFormBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class LandingPageFormCreate(LandingPageFormBase):
    organization_id: int

class LandingPageFormUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LandingPageFormResponse(LandingPageFormBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# FormSubmission Schemas
class FormSubmissionBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class FormSubmissionCreate(FormSubmissionBase):
    organization_id: int

class FormSubmissionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class FormSubmissionResponse(FormSubmissionBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Newsletter Schemas
class NewsletterBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class NewsletterCreate(NewsletterBase):
    organization_id: int

class NewsletterUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class NewsletterResponse(NewsletterBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Subscriber Schemas
class SubscriberBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class SubscriberCreate(SubscriberBase):
    organization_id: int

class SubscriberUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class SubscriberResponse(SubscriberBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# SubscriptionPreference Schemas
class SubscriptionPreferenceBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class SubscriptionPreferenceCreate(SubscriptionPreferenceBase):
    organization_id: int

class SubscriptionPreferenceUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class SubscriptionPreferenceResponse(SubscriptionPreferenceBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# MarketingTag Schemas
class MarketingTagBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class MarketingTagCreate(MarketingTagBase):
    organization_id: int

class MarketingTagUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class MarketingTagResponse(MarketingTagBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Promotion Schemas
class PromotionBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class PromotionCreate(PromotionBase):
    organization_id: int

class PromotionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class PromotionResponse(PromotionBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Coupon Schemas
class CouponBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)
    code: Optional[str] = None
    discount_amount: Optional[float] = None


class CouponCreate(CouponBase):
    organization_id: int

class CouponUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CouponResponse(CouponBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ReferralProgram Schemas
class ReferralProgramBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class ReferralProgramCreate(ReferralProgramBase):
    organization_id: int

class ReferralProgramUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class ReferralProgramResponse(ReferralProgramBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Referral Schemas
class ReferralBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class ReferralCreate(ReferralBase):
    organization_id: int

class ReferralUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class ReferralResponse(ReferralBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LoyaltyProgram Schemas
class LoyaltyProgramBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class LoyaltyProgramCreate(LoyaltyProgramBase):
    organization_id: int

class LoyaltyProgramUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LoyaltyProgramResponse(LoyaltyProgramBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LoyaltyAccount Schemas
class LoyaltyAccountBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class LoyaltyAccountCreate(LoyaltyAccountBase):
    organization_id: int

class LoyaltyAccountUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LoyaltyAccountResponse(LoyaltyAccountBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# LoyaltyTransaction Schemas
class LoyaltyTransactionBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class LoyaltyTransactionCreate(LoyaltyTransactionBase):
    organization_id: int

class LoyaltyTransactionUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class LoyaltyTransactionResponse(LoyaltyTransactionBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# MarketingAnalytics Schemas
class MarketingAnalyticsBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class MarketingAnalyticsCreate(MarketingAnalyticsBase):
    organization_id: int

class MarketingAnalyticsUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class MarketingAnalyticsResponse(MarketingAnalyticsBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# CampaignMetric Schemas
class CampaignMetricBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)

class CampaignMetricCreate(CampaignMetricBase):
    organization_id: int

class CampaignMetricUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)

class CampaignMetricResponse(CampaignMetricBase):
    id: int
    organization_id: int
    uuid: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
