from app.api.v1.endpoints.document import router as document_router
from fastapi import APIRouter

from app.api.v1.endpoints import (
    agent,
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
    notifications,
    roles,
    permissions,
    inventory,
    sales,
    finance,
    ai,
)

api_router = APIRouter()
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])


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


api_router.include_router(
    agent.router,
    prefix="/agents",
    tags=["Agents"],
)

for router, prefix, tags in inventory.INVENTORY_ROUTERS:

    api_router.include_router(
        router,
        prefix=prefix,
        tags=tags,
    )

for router, prefix, tags in manufacturing.MANUFACTURING_ROUTERS:
    api_router.include_router(
        router,
        prefix=f"/manufacturing{prefix}",
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

# AI
api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI"],
)
