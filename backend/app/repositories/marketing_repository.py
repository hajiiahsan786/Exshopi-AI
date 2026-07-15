from app.repositories.crm_repository import CRMRepository
from app.models.marketing import MarketingCampaign
from app.models.marketing import CampaignAudience
from app.models.marketing import CampaignSegment
from app.models.marketing import CampaignMember
from app.models.marketing import CampaignTemplate
from app.models.marketing import EmailTemplate
from app.models.marketing import SMSCampaign
from app.models.marketing import WhatsAppCampaign
from app.models.marketing import PushNotificationCampaign
from app.models.marketing import SocialMediaCampaign
from app.models.marketing import CampaignSchedule
from app.models.marketing import CampaignWorkflow
from app.models.marketing import AutomationRule
from app.models.marketing import TriggerEvent
from app.models.marketing import LeadScore
from app.models.marketing import CustomerJourney
from app.models.marketing import LandingPage
from app.models.marketing import LandingPageForm
from app.models.marketing import FormSubmission
from app.models.marketing import Newsletter
from app.models.marketing import Subscriber
from app.models.marketing import SubscriptionPreference
from app.models.marketing import MarketingTag
from app.models.marketing import Promotion
from app.models.marketing import Coupon
from app.models.marketing import ReferralProgram
from app.models.marketing import Referral
from app.models.marketing import LoyaltyProgram
from app.models.marketing import LoyaltyAccount
from app.models.marketing import LoyaltyTransaction
from app.models.marketing import MarketingAnalytics
from app.models.marketing import CampaignMetric

class MarketingCampaignRepository(CRMRepository[MarketingCampaign]):
    model = MarketingCampaign
    search_fields = ("name", "status")

class CampaignAudienceRepository(CRMRepository[CampaignAudience]):
    model = CampaignAudience
    search_fields = ("name", "status")

class CampaignSegmentRepository(CRMRepository[CampaignSegment]):
    model = CampaignSegment
    search_fields = ("name", "status")

class CampaignMemberRepository(CRMRepository[CampaignMember]):
    model = CampaignMember
    search_fields = ("name", "status")

class CampaignTemplateRepository(CRMRepository[CampaignTemplate]):
    model = CampaignTemplate
    search_fields = ("name", "status")

class EmailTemplateRepository(CRMRepository[EmailTemplate]):
    model = EmailTemplate
    search_fields = ("name", "status")

class SMSCampaignRepository(CRMRepository[SMSCampaign]):
    model = SMSCampaign
    search_fields = ("name", "status")

class WhatsAppCampaignRepository(CRMRepository[WhatsAppCampaign]):
    model = WhatsAppCampaign
    search_fields = ("name", "status")

class PushNotificationCampaignRepository(CRMRepository[PushNotificationCampaign]):
    model = PushNotificationCampaign
    search_fields = ("name", "status")

class SocialMediaCampaignRepository(CRMRepository[SocialMediaCampaign]):
    model = SocialMediaCampaign
    search_fields = ("name", "status")

class CampaignScheduleRepository(CRMRepository[CampaignSchedule]):
    model = CampaignSchedule
    search_fields = ("name", "status")

class CampaignWorkflowRepository(CRMRepository[CampaignWorkflow]):
    model = CampaignWorkflow
    search_fields = ("name", "status")

class AutomationRuleRepository(CRMRepository[AutomationRule]):
    model = AutomationRule
    search_fields = ("name", "status")

class TriggerEventRepository(CRMRepository[TriggerEvent]):
    model = TriggerEvent
    search_fields = ("name", "status")

class LeadScoreRepository(CRMRepository[LeadScore]):
    model = LeadScore
    search_fields = ("name", "status")

class CustomerJourneyRepository(CRMRepository[CustomerJourney]):
    model = CustomerJourney
    search_fields = ("name", "status")

class LandingPageRepository(CRMRepository[LandingPage]):
    model = LandingPage
    search_fields = ("name", "status")

class LandingPageFormRepository(CRMRepository[LandingPageForm]):
    model = LandingPageForm
    search_fields = ("name", "status")

class FormSubmissionRepository(CRMRepository[FormSubmission]):
    model = FormSubmission
    search_fields = ("name", "status")

class NewsletterRepository(CRMRepository[Newsletter]):
    model = Newsletter
    search_fields = ("name", "status")

class SubscriberRepository(CRMRepository[Subscriber]):
    model = Subscriber
    search_fields = ("name", "status")

class SubscriptionPreferenceRepository(CRMRepository[SubscriptionPreference]):
    model = SubscriptionPreference
    search_fields = ("name", "status")

class MarketingTagRepository(CRMRepository[MarketingTag]):
    model = MarketingTag
    search_fields = ("name", "status")

class PromotionRepository(CRMRepository[Promotion]):
    model = Promotion
    search_fields = ("name", "status")

class CouponRepository(CRMRepository[Coupon]):
    model = Coupon
    search_fields = ("name", "status")

class ReferralProgramRepository(CRMRepository[ReferralProgram]):
    model = ReferralProgram
    search_fields = ("name", "status")

class ReferralRepository(CRMRepository[Referral]):
    model = Referral
    search_fields = ("name", "status")

class LoyaltyProgramRepository(CRMRepository[LoyaltyProgram]):
    model = LoyaltyProgram
    search_fields = ("name", "status")

class LoyaltyAccountRepository(CRMRepository[LoyaltyAccount]):
    model = LoyaltyAccount
    search_fields = ("name", "status")

class LoyaltyTransactionRepository(CRMRepository[LoyaltyTransaction]):
    model = LoyaltyTransaction
    search_fields = ("name", "status")

class MarketingAnalyticsRepository(CRMRepository[MarketingAnalytics]):
    model = MarketingAnalytics
    search_fields = ("name", "status")

class CampaignMetricRepository(CRMRepository[CampaignMetric]):
    model = CampaignMetric
    search_fields = ("name", "status")
