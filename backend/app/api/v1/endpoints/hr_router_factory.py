import csv
import io
from typing import Any

from fastapi import APIRouter, Depends, File, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse
from app.schemas.employee import HRBulkIdsRequest, HRBulkStatusRequest, HRBulkUpdateRequest
from app.security.hr_permissions import require_hr_permission


def _clean_csv_row(row: dict[str, str | None]) -> dict[str, Any]:
    return {key: (None if value == "" else value) for key, value in row.items()}


def create_hr_router(
    *,
    service: type[Any],
    create_schema: type[Any],
    update_schema: type[Any],
    single_response: type[Any],
    permission_prefix: str,
    entity_label: str,
) -> APIRouter:
    router = APIRouter()

    def list_filters(
        organization_id: int | None = Query(default=None),
        company_id: int | None = Query(default=None),
        employee_id: int | None = Query(default=None),
        department_id: int | None = Query(default=None),
    ) -> dict[str, Any]:
        return {
            k: v
            for k, v in {
                "organization_id": organization_id,
                "company_id": company_id,
                "employee_id": employee_id,
                "department_id": department_id,
            }.items()
            if v is not None
        }

    @router.get(
        "/",
        summary=f"List {entity_label}",
        description=f"Search, filter, paginate, and sort {entity_label}.",
    )
    def list_items(
        search: str | None = Query(default=None),
        status_filter: str | None = Query(default=None, alias="status"),
        tags: str | None = Query(default=None),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=20, ge=1, le=100),
        sort_by: str = Query(default="created_at"),
        sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
        include_deleted: bool = Query(default=False),
        filters: dict[str, Any] = Depends(list_filters),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.read")),
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
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.create")),
    ):
        item = service.create(db, data, current_user.id)
        return APIResponse(message=f"{entity_label} created successfully", data=item)

    @router.post(
        "/bulk-delete",
        summary=f"Bulk delete {entity_label}",
        description=f"Soft delete multiple {entity_label} records.",
    )
    def bulk_delete(
        data: HRBulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.delete")),
    ):
        result = service.bulk_delete(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk deleted successfully", data=result)

    @router.post(
        "/bulk-restore",
        summary=f"Bulk restore {entity_label}",
        description=f"Restore multiple soft-deleted {entity_label} records.",
    )
    def bulk_restore(
        data: HRBulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.update")),
    ):
        result = service.bulk_restore(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk restored successfully", data=result)

    @router.patch(
        "/bulk-update",
        summary=f"Bulk update {entity_label}",
        description=f"Update multiple {entity_label} records.",
    )
    def bulk_update(
        data: HRBulkUpdateRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.update")),
    ):
        result = service.bulk_update(db, data.ids, data.values, current_user.id)
        return APIResponse(message=f"{entity_label} bulk updated successfully", data=result)

    @router.patch(
        "/bulk-status",
        summary=f"Bulk status update {entity_label}",
        description=f"Update the status field on multiple {entity_label} records.",
    )
    def bulk_status(
        data: HRBulkStatusRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.update")),
    ):
        result = service.bulk_status(db, data.ids, data.status, current_user.id)
        return APIResponse(message=f"{entity_label} status updated successfully", data=result)

    @router.post(
        "/import",
        summary=f"Import {entity_label} CSV",
        description=f"Import {entity_label} records from CSV with row-level validation.",
    )
    async def import_csv(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.create")),
    ):
        result = await service.import_csv(db, file, create_schema, current_user.id)
        return APIResponse(
            message=f"{entity_label} import completed",
            data=result,
        )

    @router.get(
        "/export",
        summary=f"Export {entity_label}",
        description=f"Export {entity_label} records as JSON, CSV, or Excel.",
    )
    def export_items(
        export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.read")),
    ):
        del current_user
        exported = service.export_rows(db, export_format)
        if export_format == "json":
            return APIResponse(message=f"{entity_label} exported successfully", data=exported)
        if export_format == "xlsx":
            return Response(
                content=exported,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f'attachment; filename="{permission_prefix}.xlsx"'},
            )
        return Response(
            content=exported,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{permission_prefix}.csv"'},
        )

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
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.read")),
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
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.update")),
    ):
        item = service.update(db, item_id, data, current_user.id)
        return APIResponse(message=f"{entity_label} updated successfully", data=item)

    @router.delete(
        "/{item_id}",
        response_model=single_response,
        summary=f"Soft delete {entity_label}",
        description=f"Soft delete one {entity_label}.",
    )
    def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.delete")),
    ):
        item = service.delete(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} deleted successfully", data=item)

    @router.post(
        "/{item_id}/restore",
        response_model=single_response,
        summary=f"Restore {entity_label}",
        description=f"Restore one soft-deleted {entity_label}.",
    )
    def restore_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.update")),
    ):
        item = service.restore(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} restored successfully", data=item)

    @router.delete(
        "/{item_id}/permanent",
        summary=f"Permanently delete {entity_label}",
        description=f"Permanently delete one {entity_label} record.",
    )
    def permanent_delete(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_hr_permission(f"{permission_prefix}.delete")),
    ):
        del current_user
        result = service.permanent_delete(db, item_id)
        return APIResponse(message=f"{entity_label} permanently deleted", data=result)

    return router
