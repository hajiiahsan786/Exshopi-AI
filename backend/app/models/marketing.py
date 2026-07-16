from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, Date
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class MarketingCampaign(UUIDMixin, AuditMixin, Base):
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    budget = Column(Float)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    roi = Column(Float, nullable=True)
    organization = relationship("Organization")


class CampaignAudience(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_audiences"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class CampaignSegment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_segments"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class CampaignMember(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_members"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class CampaignTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_templates"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class EmailTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    subject = Column(String(255))
    body_html = Column(Text)
    body_text = Column(Text)
    organization = relationship("Organization")


class SMSCampaign(UUIDMixin, AuditMixin, Base):
    __tablename__ = "s_m_s_campaigns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class WhatsAppCampaign(UUIDMixin, AuditMixin, Base):
    __tablename__ = "whats_app_campaigns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class PushNotificationCampaign(UUIDMixin, AuditMixin, Base):
    __tablename__ = "push_notification_campaigns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class SocialMediaCampaign(UUIDMixin, AuditMixin, Base):
    __tablename__ = "social_media_campaigns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class CampaignSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_schedules"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    scheduled_date = Column(DateTime(timezone=True))
    organization = relationship("Organization")


class CampaignWorkflow(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_workflows"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class AutomationRule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class TriggerEvent(UUIDMixin, AuditMixin, Base):
    __tablename__ = "trigger_events"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LeadScore(UUIDMixin, AuditMixin, Base):
    __tablename__ = "lead_scores"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), index=True)
    score = Column(Integer, default=0)
    organization = relationship("Organization")


class CustomerJourney(UUIDMixin, AuditMixin, Base):
    __tablename__ = "customer_journeies"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LandingPage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "landing_pages"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LandingPageForm(UUIDMixin, AuditMixin, Base):
    __tablename__ = "landing_page_forms"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class FormSubmission(UUIDMixin, AuditMixin, Base):
    __tablename__ = "form_submissions"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class Newsletter(UUIDMixin, AuditMixin, Base):
    __tablename__ = "newsletters"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class Subscriber(UUIDMixin, AuditMixin, Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class SubscriptionPreference(UUIDMixin, AuditMixin, Base):
    __tablename__ = "subscription_preferences"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class MarketingTag(UUIDMixin, AuditMixin, Base):
    __tablename__ = "marketing_tags"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class Promotion(UUIDMixin, AuditMixin, Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class Coupon(UUIDMixin, AuditMixin, Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    code = Column(String(50), unique=True, index=True)
    discount_amount = Column(Float)
    organization = relationship("Organization")


class ReferralProgram(UUIDMixin, AuditMixin, Base):
    __tablename__ = "referral_programs"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class Referral(UUIDMixin, AuditMixin, Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LoyaltyProgram(UUIDMixin, AuditMixin, Base):
    __tablename__ = "loyalty_programs"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LoyaltyAccount(UUIDMixin, AuditMixin, Base):
    __tablename__ = "loyalty_accounts"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class LoyaltyTransaction(UUIDMixin, AuditMixin, Base):
    __tablename__ = "loyalty_transactions"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class MarketingAnalytics(UUIDMixin, AuditMixin, Base):
    __tablename__ = "marketing_analyticss"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")

class CampaignMetric(UUIDMixin, AuditMixin, Base):
    __tablename__ = "campaign_metrics"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    organization = relationship("Organization")
