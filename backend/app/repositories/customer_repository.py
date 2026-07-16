from app.models.customer import Customer
from app.repositories.crm_repository import CRMRepository


class CustomerRepository(CRMRepository[Customer]):
    model = Customer
    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone",
        "mobile",
        "status",
        "customer_code",
    )
    tag_field = "tags"
