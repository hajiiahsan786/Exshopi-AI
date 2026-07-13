import csv
import io
from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, File, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse
from app.schemas.inventory import BulkIdsRequest, BulkStatusRequest, BulkUpdateRequest
from app.security.sales_permissions import require_sales_permission


def _clean_csv_row(row: dict[str, str | None]) -> dict[str, Any]:
    return {key: (None if value == "" else value) for key, value in row.items()}


def create_sales_router(
    *,
    service: type[Any],
    create_schema: type[Any],
    update_schema: type[Any],
    single_response: type[Any],
    list_response: type[Any],
    permission_prefix: str,
    entity_label: str,
    manager_permissions: tuple[str, ...] = (),
) -> APIRouter:
    router = APIRouter()

    def list_filters(
        organization_id: int | None = Query(default=None),
        company_id: int | None = Query(default=None),
        customer_id: int | None = Query(default=None),
        order_id: int | None = Query(default=None),
        quote_id: int | None = Query(default=None),
        invoice_id: int | None = Query(default=None),
        product_id: int | None = Query(default=None),
        variant_id: int | None = Query(default=None),
        warehouse_id: int | None = Query(default=None),
        payment_status: str | None = Query(default=None),
        shipment_status: str | None = Query(default=None),
        payment_method: str | None = Query(default=None),
        courier: str | None = Query(default=None),
        date_from: datetime | None = Query(default=None),
        date_to: datetime | None = Query(default=None),
        amount_min: Decimal | None = Query(default=None, ge=0),
        amount_max: Decimal | None = Query(default=None, ge=0),
        total_min: Decimal | None = Query(default=None, ge=0),
        total_max: Decimal | None = Query(default=None, ge=0),
    ) -> dict[str, Any]:
        return {
            key: value
            for key, value in {
                "organization_id": organization_id,
                "company_id": company_id,
                "customer_id": customer_id,
                "order_id": order_id,
                "quote_id": quote_id,
                "invoice_id": invoice_id,
                "product_id": product_id,
                "variant_id": variant_id,
                "warehouse_id": warehouse_id,
                "payment_status": payment_status,
                "shipment_status": shipment_status,
                "payment_method": payment_method,
                "courier": courier,
                "date_from": date_from,
                "date_to": date_to,
                "amount_min": amount_min,
                "amount_max": amount_max,
                "total_min": total_min,
                "total_max": total_max,
            }.items()
            if value is not None
        }

    @router.get(
        "/",
        response_model=list_response,
        summary=f"List {entity_label}",
        description=f"Search, filter, paginate, and sort {entity_label}.",
    )
    def list_items(
        search: str | None = Query(default=None),
        status_filter: str | None = Query(default=None, alias="status"),
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=20, ge=1, le=100),
        sort_by: str = Query(default="created_at"),
        sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
        include_deleted: bool = Query(default=False),
        filters: dict[str, Any] = Depends(list_filters),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.read", *manager_permissions)),
    ):
        del current_user
        result = service.list(
            db,
            search=search,
            status=status_filter,
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
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.create", *manager_permissions)),
    ):
        item = service.create(db, data, current_user.id)
        return APIResponse(message=f"{entity_label} created successfully", data=item)

    @router.post("/bulk-delete", summary=f"Bulk delete {entity_label}")
    def bulk_delete(
        data: BulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        result = service.bulk_delete(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk deleted successfully", data=result)

    @router.post("/bulk-restore", summary=f"Bulk restore {entity_label}")
    def bulk_restore(
        data: BulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_restore(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk restored successfully", data=result)

    @router.patch("/bulk-update", summary=f"Bulk update {entity_label}")
    def bulk_update(
        data: BulkUpdateRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_update(db, data.ids, data.values, current_user.id)
        return APIResponse(message=f"{entity_label} bulk updated successfully", data=result)

    @router.patch("/bulk-status", summary=f"Bulk status update {entity_label}")
    def bulk_status(
        data: BulkStatusRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_status(db, data.ids, data.status, current_user.id)
        return APIResponse(message=f"{entity_label} status updated successfully", data=result)

    @router.post("/import", summary=f"Import {entity_label} CSV")
    async def import_csv(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.create", *manager_permissions)),
    ):
        raw = await file.read()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        created: list[int] = []
        errors: list[dict[str, Any]] = []
        for row_number, row in enumerate(reader, start=2):
            try:
                data = create_schema(**_clean_csv_row(row))
                item = service.create(db, data, current_user.id)
                created.append(item.id)
            except Exception as exc:  # noqa: BLE001 - row-level imports must continue collecting errors.
                errors.append({"row": row_number, "error": getattr(exc, "detail", str(exc))})
        return APIResponse(message=f"{entity_label} import completed", data={"created": len(created), "ids": created, "errors": errors})

    @router.get("/export", summary=f"Export {entity_label}")
    def export_items(
        export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.read", *manager_permissions)),
    ):
        del current_user
        exported = service.export_rows(db, export_format)
        filename = permission_prefix.replace(".", "-")
        if export_format == "json":
            return APIResponse(message=f"{entity_label} exported successfully", data=exported)
        if export_format == "xlsx":
            return Response(
                content=exported,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f'attachment; filename="{filename}.xlsx"'},
            )
        return Response(
            content=exported,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}.csv"'},
        )

    @router.get("/{item_id}", response_model=single_response, summary=f"Get {entity_label}")
    def get_item(
        item_id: int,
        include_deleted: bool = Query(default=False),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.read", *manager_permissions)),
    ):
        del current_user
        item = service.get(db, item_id, include_deleted=include_deleted)
        return APIResponse(message=f"{entity_label} loaded", data=item)

    @router.patch("/{item_id}", response_model=single_response, summary=f"Update {entity_label}")
    def update_item(
        item_id: int,
        data: update_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        item = service.update(db, item_id, data, current_user.id)
        return APIResponse(message=f"{entity_label} updated successfully", data=item)

    @router.delete("/{item_id}", response_model=single_response, summary=f"Soft delete {entity_label}")
    def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        item = service.delete(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} deleted successfully", data=item)

    @router.post("/{item_id}/restore", response_model=single_response, summary=f"Restore {entity_label}")
    def restore_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        item = service.restore(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} restored successfully", data=item)

    @router.delete("/{item_id}/permanent", summary=f"Permanently delete {entity_label}")
    def permanent_delete(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_sales_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        del current_user
        result = service.permanent_delete(db, item_id)
        return APIResponse(message=f"{entity_label} permanently deleted", data=result)

    return router
