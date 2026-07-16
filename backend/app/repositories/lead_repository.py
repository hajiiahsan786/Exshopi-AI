from app.models.lead import Lead
from app.repositories.crm_repository import CRMRepository


class LeadRepository(CRMRepository[Lead]):
    model = Lead
    search_fields = ("full_name", "email", "phone", "company", "status", "lead_number")
