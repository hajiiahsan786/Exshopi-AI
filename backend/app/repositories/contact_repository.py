from app.models.contact import Contact
from app.repositories.crm_repository import CRMRepository


class ContactRepository(CRMRepository[Contact]):
    model = Contact
    search_fields = ("first_name", "last_name", "email", "phone", "department", "position")
