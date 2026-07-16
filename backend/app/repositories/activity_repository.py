from app.models.activity import Activity
from app.repositories.crm_repository import CRMRepository


class ActivityRepository(CRMRepository[Activity]):
    model = Activity
    search_fields = ("subject", "description", "activity_type", "status")
