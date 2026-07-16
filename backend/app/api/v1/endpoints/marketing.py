from fastapi import APIRouter
from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.services.marketing_service import (
MarketingCampaignService,
    CampaignAudienceService,
    CampaignSegmentService,
    CampaignMemberService,
    CampaignTemplateService,
    EmailTemplateService,
    SMSCampaignService,
    WhatsAppCampaignService,
    PushNotificationCampaignService,
    SocialMediaCampaignService,
    CampaignScheduleService,
    CampaignWorkflowService,
    AutomationRuleService,
    TriggerEventService,
    LeadScoreService,
    CustomerJourneyService,
    LandingPageService,
    LandingPageFormService,
    FormSubmissionService,
    NewsletterService,
    SubscriberService,
    SubscriptionPreferenceService,
    MarketingTagService,
    PromotionService,
    CouponService,
    ReferralProgramService,
    ReferralService,
    LoyaltyProgramService,
    LoyaltyAccountService,
    LoyaltyTransactionService,
    MarketingAnalyticsService,
    CampaignMetricService
)
from app.schemas.marketing import MarketingCampaignCreate, MarketingCampaignUpdate, MarketingCampaignResponse
from app.schemas.marketing import CampaignAudienceCreate, CampaignAudienceUpdate, CampaignAudienceResponse
from app.schemas.marketing import CampaignSegmentCreate, CampaignSegmentUpdate, CampaignSegmentResponse
from app.schemas.marketing import CampaignMemberCreate, CampaignMemberUpdate, CampaignMemberResponse
from app.schemas.marketing import CampaignTemplateCreate, CampaignTemplateUpdate, CampaignTemplateResponse
from app.schemas.marketing import EmailTemplateCreate, EmailTemplateUpdate, EmailTemplateResponse
from app.schemas.marketing import SMSCampaignCreate, SMSCampaignUpdate, SMSCampaignResponse
from app.schemas.marketing import WhatsAppCampaignCreate, WhatsAppCampaignUpdate, WhatsAppCampaignResponse
from app.schemas.marketing import PushNotificationCampaignCreate, PushNotificationCampaignUpdate, PushNotificationCampaignResponse
from app.schemas.marketing import SocialMediaCampaignCreate, SocialMediaCampaignUpdate, SocialMediaCampaignResponse
from app.schemas.marketing import CampaignScheduleCreate, CampaignScheduleUpdate, CampaignScheduleResponse
from app.schemas.marketing import CampaignWorkflowCreate, CampaignWorkflowUpdate, CampaignWorkflowResponse
from app.schemas.marketing import AutomationRuleCreate, AutomationRuleUpdate, AutomationRuleResponse
from app.schemas.marketing import TriggerEventCreate, TriggerEventUpdate, TriggerEventResponse
from app.schemas.marketing import LeadScoreCreate, LeadScoreUpdate, LeadScoreResponse
from app.schemas.marketing import CustomerJourneyCreate, CustomerJourneyUpdate, CustomerJourneyResponse
from app.schemas.marketing import LandingPageCreate, LandingPageUpdate, LandingPageResponse
from app.schemas.marketing import LandingPageFormCreate, LandingPageFormUpdate, LandingPageFormResponse
from app.schemas.marketing import FormSubmissionCreate, FormSubmissionUpdate, FormSubmissionResponse
from app.schemas.marketing import NewsletterCreate, NewsletterUpdate, NewsletterResponse
from app.schemas.marketing import SubscriberCreate, SubscriberUpdate, SubscriberResponse
from app.schemas.marketing import SubscriptionPreferenceCreate, SubscriptionPreferenceUpdate, SubscriptionPreferenceResponse
from app.schemas.marketing import MarketingTagCreate, MarketingTagUpdate, MarketingTagResponse
from app.schemas.marketing import PromotionCreate, PromotionUpdate, PromotionResponse
from app.schemas.marketing import CouponCreate, CouponUpdate, CouponResponse
from app.schemas.marketing import ReferralProgramCreate, ReferralProgramUpdate, ReferralProgramResponse
from app.schemas.marketing import ReferralCreate, ReferralUpdate, ReferralResponse
from app.schemas.marketing import LoyaltyProgramCreate, LoyaltyProgramUpdate, LoyaltyProgramResponse
from app.schemas.marketing import LoyaltyAccountCreate, LoyaltyAccountUpdate, LoyaltyAccountResponse
from app.schemas.marketing import LoyaltyTransactionCreate, LoyaltyTransactionUpdate, LoyaltyTransactionResponse
from app.schemas.marketing import MarketingAnalyticsCreate, MarketingAnalyticsUpdate, MarketingAnalyticsResponse
from app.schemas.marketing import CampaignMetricCreate, CampaignMetricUpdate, CampaignMetricResponse

router = APIRouter()
MARKETING_ROUTERS = []

marketingcampaign_router = create_crm_router(
    service=MarketingCampaignService,
    create_schema=MarketingCampaignCreate,
    update_schema=MarketingCampaignUpdate,
    single_response=MarketingCampaignResponse,
    list_response=MarketingCampaignResponse,
    permission_prefix="marketing:marketing-campaigns",
    entity_label="MarketingCampaign",
)
MARKETING_ROUTERS.append(
    (marketingcampaign_router, "/marketing-campaigns", ["MarketingCampaign"])
)

campaignaudience_router = create_crm_router(
    service=CampaignAudienceService,
    create_schema=CampaignAudienceCreate,
    update_schema=CampaignAudienceUpdate,
    single_response=CampaignAudienceResponse,
    list_response=CampaignAudienceResponse,
    permission_prefix="marketing:campaign-audiences",
    entity_label="CampaignAudience",
)
MARKETING_ROUTERS.append(
    (campaignaudience_router, "/campaign-audiences", ["CampaignAudience"])
)

campaignsegment_router = create_crm_router(
    service=CampaignSegmentService,
    create_schema=CampaignSegmentCreate,
    update_schema=CampaignSegmentUpdate,
    single_response=CampaignSegmentResponse,
    list_response=CampaignSegmentResponse,
    permission_prefix="marketing:campaign-segments",
    entity_label="CampaignSegment",
)
MARKETING_ROUTERS.append(
    (campaignsegment_router, "/campaign-segments", ["CampaignSegment"])
)

campaignmember_router = create_crm_router(
    service=CampaignMemberService,
    create_schema=CampaignMemberCreate,
    update_schema=CampaignMemberUpdate,
    single_response=CampaignMemberResponse,
    list_response=CampaignMemberResponse,
    permission_prefix="marketing:campaign-members",
    entity_label="CampaignMember",
)
MARKETING_ROUTERS.append(
    (campaignmember_router, "/campaign-members", ["CampaignMember"])
)

campaigntemplate_router = create_crm_router(
    service=CampaignTemplateService,
    create_schema=CampaignTemplateCreate,
    update_schema=CampaignTemplateUpdate,
    single_response=CampaignTemplateResponse,
    list_response=CampaignTemplateResponse,
    permission_prefix="marketing:campaign-templates",
    entity_label="CampaignTemplate",
)
MARKETING_ROUTERS.append(
    (campaigntemplate_router, "/campaign-templates", ["CampaignTemplate"])
)

emailtemplate_router = create_crm_router(
    service=EmailTemplateService,
    create_schema=EmailTemplateCreate,
    update_schema=EmailTemplateUpdate,
    single_response=EmailTemplateResponse,
    list_response=EmailTemplateResponse,
    permission_prefix="marketing:email-templates",
    entity_label="EmailTemplate",
)
MARKETING_ROUTERS.append(
    (emailtemplate_router, "/email-templates", ["EmailTemplate"])
)

smscampaign_router = create_crm_router(
    service=SMSCampaignService,
    create_schema=SMSCampaignCreate,
    update_schema=SMSCampaignUpdate,
    single_response=SMSCampaignResponse,
    list_response=SMSCampaignResponse,
    permission_prefix="marketing:s-m-s-campaigns",
    entity_label="SMSCampaign",
)
MARKETING_ROUTERS.append(
    (smscampaign_router, "/s-m-s-campaigns", ["SMSCampaign"])
)

whatsappcampaign_router = create_crm_router(
    service=WhatsAppCampaignService,
    create_schema=WhatsAppCampaignCreate,
    update_schema=WhatsAppCampaignUpdate,
    single_response=WhatsAppCampaignResponse,
    list_response=WhatsAppCampaignResponse,
    permission_prefix="marketing:whats-app-campaigns",
    entity_label="WhatsAppCampaign",
)
MARKETING_ROUTERS.append(
    (whatsappcampaign_router, "/whats-app-campaigns", ["WhatsAppCampaign"])
)

pushnotificationcampaign_router = create_crm_router(
    service=PushNotificationCampaignService,
    create_schema=PushNotificationCampaignCreate,
    update_schema=PushNotificationCampaignUpdate,
    single_response=PushNotificationCampaignResponse,
    list_response=PushNotificationCampaignResponse,
    permission_prefix="marketing:push-notification-campaigns",
    entity_label="PushNotificationCampaign",
)
MARKETING_ROUTERS.append(
    (pushnotificationcampaign_router, "/push-notification-campaigns", ["PushNotificationCampaign"])
)

socialmediacampaign_router = create_crm_router(
    service=SocialMediaCampaignService,
    create_schema=SocialMediaCampaignCreate,
    update_schema=SocialMediaCampaignUpdate,
    single_response=SocialMediaCampaignResponse,
    list_response=SocialMediaCampaignResponse,
    permission_prefix="marketing:social-media-campaigns",
    entity_label="SocialMediaCampaign",
)
MARKETING_ROUTERS.append(
    (socialmediacampaign_router, "/social-media-campaigns", ["SocialMediaCampaign"])
)

campaignschedule_router = create_crm_router(
    service=CampaignScheduleService,
    create_schema=CampaignScheduleCreate,
    update_schema=CampaignScheduleUpdate,
    single_response=CampaignScheduleResponse,
    list_response=CampaignScheduleResponse,
    permission_prefix="marketing:campaign-schedules",
    entity_label="CampaignSchedule",
)
MARKETING_ROUTERS.append(
    (campaignschedule_router, "/campaign-schedules", ["CampaignSchedule"])
)

campaignworkflow_router = create_crm_router(
    service=CampaignWorkflowService,
    create_schema=CampaignWorkflowCreate,
    update_schema=CampaignWorkflowUpdate,
    single_response=CampaignWorkflowResponse,
    list_response=CampaignWorkflowResponse,
    permission_prefix="marketing:campaign-workflows",
    entity_label="CampaignWorkflow",
)
MARKETING_ROUTERS.append(
    (campaignworkflow_router, "/campaign-workflows", ["CampaignWorkflow"])
)

automationrule_router = create_crm_router(
    service=AutomationRuleService,
    create_schema=AutomationRuleCreate,
    update_schema=AutomationRuleUpdate,
    single_response=AutomationRuleResponse,
    list_response=AutomationRuleResponse,
    permission_prefix="marketing:automation-rules",
    entity_label="AutomationRule",
)
MARKETING_ROUTERS.append(
    (automationrule_router, "/automation-rules", ["AutomationRule"])
)

triggerevent_router = create_crm_router(
    service=TriggerEventService,
    create_schema=TriggerEventCreate,
    update_schema=TriggerEventUpdate,
    single_response=TriggerEventResponse,
    list_response=TriggerEventResponse,
    permission_prefix="marketing:trigger-events",
    entity_label="TriggerEvent",
)
MARKETING_ROUTERS.append(
    (triggerevent_router, "/trigger-events", ["TriggerEvent"])
)

leadscore_router = create_crm_router(
    service=LeadScoreService,
    create_schema=LeadScoreCreate,
    update_schema=LeadScoreUpdate,
    single_response=LeadScoreResponse,
    list_response=LeadScoreResponse,
    permission_prefix="marketing:lead-scores",
    entity_label="LeadScore",
)
MARKETING_ROUTERS.append(
    (leadscore_router, "/lead-scores", ["LeadScore"])
)

customerjourney_router = create_crm_router(
    service=CustomerJourneyService,
    create_schema=CustomerJourneyCreate,
    update_schema=CustomerJourneyUpdate,
    single_response=CustomerJourneyResponse,
    list_response=CustomerJourneyResponse,
    permission_prefix="marketing:customer-journeies",
    entity_label="CustomerJourney",
)
MARKETING_ROUTERS.append(
    (customerjourney_router, "/customer-journeies", ["CustomerJourney"])
)

landingpage_router = create_crm_router(
    service=LandingPageService,
    create_schema=LandingPageCreate,
    update_schema=LandingPageUpdate,
    single_response=LandingPageResponse,
    list_response=LandingPageResponse,
    permission_prefix="marketing:landing-pages",
    entity_label="LandingPage",
)
MARKETING_ROUTERS.append(
    (landingpage_router, "/landing-pages", ["LandingPage"])
)

landingpageform_router = create_crm_router(
    service=LandingPageFormService,
    create_schema=LandingPageFormCreate,
    update_schema=LandingPageFormUpdate,
    single_response=LandingPageFormResponse,
    list_response=LandingPageFormResponse,
    permission_prefix="marketing:landing-page-forms",
    entity_label="LandingPageForm",
)
MARKETING_ROUTERS.append(
    (landingpageform_router, "/landing-page-forms", ["LandingPageForm"])
)

formsubmission_router = create_crm_router(
    service=FormSubmissionService,
    create_schema=FormSubmissionCreate,
    update_schema=FormSubmissionUpdate,
    single_response=FormSubmissionResponse,
    list_response=FormSubmissionResponse,
    permission_prefix="marketing:form-submissions",
    entity_label="FormSubmission",
)
MARKETING_ROUTERS.append(
    (formsubmission_router, "/form-submissions", ["FormSubmission"])
)

newsletter_router = create_crm_router(
    service=NewsletterService,
    create_schema=NewsletterCreate,
    update_schema=NewsletterUpdate,
    single_response=NewsletterResponse,
    list_response=NewsletterResponse,
    permission_prefix="marketing:newsletters",
    entity_label="Newsletter",
)
MARKETING_ROUTERS.append(
    (newsletter_router, "/newsletters", ["Newsletter"])
)

subscriber_router = create_crm_router(
    service=SubscriberService,
    create_schema=SubscriberCreate,
    update_schema=SubscriberUpdate,
    single_response=SubscriberResponse,
    list_response=SubscriberResponse,
    permission_prefix="marketing:subscribers",
    entity_label="Subscriber",
)
MARKETING_ROUTERS.append(
    (subscriber_router, "/subscribers", ["Subscriber"])
)

subscriptionpreference_router = create_crm_router(
    service=SubscriptionPreferenceService,
    create_schema=SubscriptionPreferenceCreate,
    update_schema=SubscriptionPreferenceUpdate,
    single_response=SubscriptionPreferenceResponse,
    list_response=SubscriptionPreferenceResponse,
    permission_prefix="marketing:subscription-preferences",
    entity_label="SubscriptionPreference",
)
MARKETING_ROUTERS.append(
    (subscriptionpreference_router, "/subscription-preferences", ["SubscriptionPreference"])
)

marketingtag_router = create_crm_router(
    service=MarketingTagService,
    create_schema=MarketingTagCreate,
    update_schema=MarketingTagUpdate,
    single_response=MarketingTagResponse,
    list_response=MarketingTagResponse,
    permission_prefix="marketing:marketing-tags",
    entity_label="MarketingTag",
)
MARKETING_ROUTERS.append(
    (marketingtag_router, "/marketing-tags", ["MarketingTag"])
)

promotion_router = create_crm_router(
    service=PromotionService,
    create_schema=PromotionCreate,
    update_schema=PromotionUpdate,
    single_response=PromotionResponse,
    list_response=PromotionResponse,
    permission_prefix="marketing:promotions",
    entity_label="Promotion",
)
MARKETING_ROUTERS.append(
    (promotion_router, "/promotions", ["Promotion"])
)

coupon_router = create_crm_router(
    service=CouponService,
    create_schema=CouponCreate,
    update_schema=CouponUpdate,
    single_response=CouponResponse,
    list_response=CouponResponse,
    permission_prefix="marketing:coupons",
    entity_label="Coupon",
)
MARKETING_ROUTERS.append(
    (coupon_router, "/coupons", ["Coupon"])
)

referralprogram_router = create_crm_router(
    service=ReferralProgramService,
    create_schema=ReferralProgramCreate,
    update_schema=ReferralProgramUpdate,
    single_response=ReferralProgramResponse,
    list_response=ReferralProgramResponse,
    permission_prefix="marketing:referral-programs",
    entity_label="ReferralProgram",
)
MARKETING_ROUTERS.append(
    (referralprogram_router, "/referral-programs", ["ReferralProgram"])
)

referral_router = create_crm_router(
    service=ReferralService,
    create_schema=ReferralCreate,
    update_schema=ReferralUpdate,
    single_response=ReferralResponse,
    list_response=ReferralResponse,
    permission_prefix="marketing:referrals",
    entity_label="Referral",
)
MARKETING_ROUTERS.append(
    (referral_router, "/referrals", ["Referral"])
)

loyaltyprogram_router = create_crm_router(
    service=LoyaltyProgramService,
    create_schema=LoyaltyProgramCreate,
    update_schema=LoyaltyProgramUpdate,
    single_response=LoyaltyProgramResponse,
    list_response=LoyaltyProgramResponse,
    permission_prefix="marketing:loyalty-programs",
    entity_label="LoyaltyProgram",
)
MARKETING_ROUTERS.append(
    (loyaltyprogram_router, "/loyalty-programs", ["LoyaltyProgram"])
)

loyaltyaccount_router = create_crm_router(
    service=LoyaltyAccountService,
    create_schema=LoyaltyAccountCreate,
    update_schema=LoyaltyAccountUpdate,
    single_response=LoyaltyAccountResponse,
    list_response=LoyaltyAccountResponse,
    permission_prefix="marketing:loyalty-accounts",
    entity_label="LoyaltyAccount",
)
MARKETING_ROUTERS.append(
    (loyaltyaccount_router, "/loyalty-accounts", ["LoyaltyAccount"])
)

loyaltytransaction_router = create_crm_router(
    service=LoyaltyTransactionService,
    create_schema=LoyaltyTransactionCreate,
    update_schema=LoyaltyTransactionUpdate,
    single_response=LoyaltyTransactionResponse,
    list_response=LoyaltyTransactionResponse,
    permission_prefix="marketing:loyalty-transactions",
    entity_label="LoyaltyTransaction",
)
MARKETING_ROUTERS.append(
    (loyaltytransaction_router, "/loyalty-transactions", ["LoyaltyTransaction"])
)

marketinganalytics_router = create_crm_router(
    service=MarketingAnalyticsService,
    create_schema=MarketingAnalyticsCreate,
    update_schema=MarketingAnalyticsUpdate,
    single_response=MarketingAnalyticsResponse,
    list_response=MarketingAnalyticsResponse,
    permission_prefix="marketing:marketing-analyticss",
    entity_label="MarketingAnalytics",
)
MARKETING_ROUTERS.append(
    (marketinganalytics_router, "/marketing-analyticss", ["MarketingAnalytics"])
)

campaignmetric_router = create_crm_router(
    service=CampaignMetricService,
    create_schema=CampaignMetricCreate,
    update_schema=CampaignMetricUpdate,
    single_response=CampaignMetricResponse,
    list_response=CampaignMetricResponse,
    permission_prefix="marketing:campaign-metrics",
    entity_label="CampaignMetric",
)
MARKETING_ROUTERS.append(
    (campaignmetric_router, "/campaign-metrics", ["CampaignMetric"])
)
