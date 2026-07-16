from typing import Any

from fastapi import APIRouter, Depends, Query
from app.api.v1.endpoints.crm_router_factory import create_crm_router

def create_project_router(
    *,
    service: type[Any],
    create_schema: type[Any],
    update_schema: type[Any],
    single_response: type[Any],
    list_response: type[Any],
    permission_prefix: str,
    entity_label: str,
    extra_filters: tuple[str, ...] = (),
) -> APIRouter:

    # We leverage the existing crm_router_factory which provides standard CRM CRUD
    router = create_crm_router(
        service=service,
        create_schema=create_schema,
        update_schema=update_schema,
        single_response=single_response,
        list_response=list_response,
        permission_prefix=permission_prefix,
        entity_label=entity_label,
        extra_filters=extra_filters,
    )

    return router
