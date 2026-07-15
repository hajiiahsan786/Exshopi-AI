from app.api.v1.endpoints.document import router as document_router
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    organizations,
    companies,
    departments,
    employees,
    customers,
    leads,
    contacts,
    opportunities,
    activities,
    tasks,
    roles,
    permissions,
    inventory,
    sales,
    finance,
)

api_router = APIRouter()


# Authentication
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

# Users
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

# Organizations
api_router.include_router(
    organizations.router,
    prefix="/organizations",
    tags=["Organizations"],
)

# Companies
api_router.include_router(
    companies.router,
    prefix="/companies",
    tags=["Companies"],
)

# Departments
api_router.include_router(
    departments.router,
    prefix="/departments",
    tags=["Departments"],
)

# Employees
api_router.include_router(
    employees.router,
    prefix="/employees",
    tags=["Employees"],
)

api_router.include_router(
    customers.router,
    prefix="/customers",
    tags=["Customers"],
)

api_router.include_router(
    leads.router,
    prefix="/leads",
    tags=["Leads"],
)

api_router.include_router(
    contacts.router,
    prefix="/contacts",
    tags=["Contacts"],
)

api_router.include_router(
    opportunities.router,
    prefix="/opportunities",
    tags=["Opportunities"],
)

api_router.include_router(
    activities.router,
    prefix="/activities",
    tags=["Activities"],
)

api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["Tasks"],
)

api_router.include_router(
    roles.router,
    prefix="/roles",
    tags=["Roles"],
)

api_router.include_router(
    permissions.router,
    prefix="/permissions",
    tags=["Permissions"],
)

for router, prefix, tags in inventory.INVENTORY_ROUTERS:
    api_router.include_router(
        router,
        prefix=prefix,
        tags=tags,
    )

for router, prefix, tags in sales.SALES_ROUTERS:
    api_router.include_router(
        router,
        prefix=prefix,
        tags=tags,
    )

for router, prefix, tags in finance.FINANCE_ROUTERS:
    api_router.include_router(
        router,
        prefix=prefix,
        tags=tags,
    )

api_router.include_router(document_router, prefix="/documents", tags=["documents"])
