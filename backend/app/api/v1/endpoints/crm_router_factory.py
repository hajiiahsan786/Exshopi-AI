from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse
from app.security.crm_permissions import require_crm_permission


def create_crm_router(
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
    router = APIRouter()

    def list_filters(
        organization_id: int | None = Query(default=None),
        company_id: int | None = Query(default=None),
        customer_id: int | None = Query(default=None),
        lead_id: int | None = Query(default=None),
        assigned_to: int | None = Query(default=None),
        owner: int | None = Query(default=None),
    ) -> dict[str, int | None]:
        values = {
            "organization_id": organization_id,
            "company_id": company_id,
            "customer_id": customer_id,
            "lead_id": lead_id,
            "assigned_to": assigned_to,
            "owner": owner,
        }
        return {key: value for key, value in values.items() if key in extra_filters}

    @router.get(
        "/",
        response_model=list_response,
        summary=f"List {entity_label}",
        description=f"Search, filter, paginate, and sort {entity_label}.",
    )
    def list_items(
        search: str | None = Query(default=None, description="Search by name, phone, email, company, status, or tags where supported."),
        status_filter: str | None = Query(default=None, alias="status"),
        tags: str | None = Query(default=None),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=20, ge=1, le=100),
        sort_by: str = Query(default="created_at"),
        sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
        include_deleted: bool = Query(default=False),
        filters: dict[str, int | None] = Depends(list_filters),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.read")),
    ):
        del current_user
        result = service.list(
            db,
            search=search,
            status=status_filter,
            tags=tags,
            filters=filters,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            include_deleted=include_deleted,
        )
        return APIResponse(message=f"{entity_label} loaded", data=result)

    @router.post(
        "/",
        response_model=single_response,
        status_code=status.HTTP_201_CREATED,
        summary=f"Create {entity_label}",
        description=f"Create a new {entity_label} record.",
    )
    def create_item(
        data: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.create")),
    ):
        item = service.create(db, data, current_user.id)
        return APIResponse(message=f"{entity_label} created", data=item)

    @router.get(
        "/{item_id}",
        response_model=single_response,
        summary=f"Get {entity_label}",
        description=f"Load one {entity_label} by ID.",
    )
    def get_item(
        item_id: int,
        include_deleted: bool = Query(default=False),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.read")),
    ):
        del current_user
        item = service.get(db, item_id, include_deleted=include_deleted)
        return APIResponse(message=f"{entity_label} loaded", data=item)

    @router.patch(
        "/{item_id}",
        response_model=single_response,
        summary=f"Update {entity_label}",
        description=f"Partially update one {entity_label}.",
    )
    def update_item(
        item_id: int,
        data: update_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.update")),
    ):
        item = service.update(db, item_id, data, current_user.id)
        return APIResponse(message=f"{entity_label} updated", data=item)

    @router.delete(
        "/{item_id}",
        response_model=single_response,
        summary=f"Soft delete {entity_label}",
        description=f"Soft delete one {entity_label}.",
    )
    def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.delete")),
    ):
        item = service.delete(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} deleted", data=item)

    @router.post(
        "/{item_id}/restore",
        response_model=single_response,
        summary=f"Restore {entity_label}",
        description=f"Restore one soft-deleted {entity_label}.",
    )
    def restore_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_crm_permission(f"{permission_prefix}.update")),
    ):
        item = service.restore(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} restored", data=item)

    return router
