from app.models.opportunity import Opportunity
from app.repositories.crm_repository import CRMRepository


class OpportunityRepository(CRMRepository[Opportunity]):
    model = Opportunity
    search_fields = ("title", "pipeline", "stage", "status")
