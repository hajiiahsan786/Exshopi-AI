from app.models.crm_task import CRMTask
from app.repositories.crm_repository import CRMRepository


class CRMTaskRepository(CRMRepository[CRMTask]):
    model = CRMTask
    search_fields = ("title", "description", "status", "priority")
