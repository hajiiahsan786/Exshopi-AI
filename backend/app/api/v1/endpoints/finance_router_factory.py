from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, File, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse
from app.schemas.inventory import BulkIdsRequest, BulkStatusRequest, BulkUpdateRequest
from app.security.finance_permissions import require_finance_permission


def create_finance_router(
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
        account_id: int | None = Query(default=None),
        account_type_id: int | None = Query(default=None),
        fiscal_year_id: int | None = Query(default=None),
        fiscal_period_id: int | None = Query(default=None),
        cost_center_id: int | None = Query(default=None),
        currency_id: int | None = Query(default=None),
        customer_id: int | None = Query(default=None),
        supplier_id: int | None = Query(default=None),
        invoice_id: int | None = Query(default=None),
        payment_id: int | None = Query(default=None),
        vendor_bill_id: int | None = Query(default=None),
        expense_id: int | None = Query(default=None),
        asset_id: int | None = Query(default=None),
        bank_account_id: int | None = Query(default=None),
        source_type: str | None = Query(default=None),
        source_id: int | None = Query(default=None),
        transaction_type: str | None = Query(default=None),
        is_reconciled: bool | None = Query(default=None),
        date_from: datetime | None = Query(default=None),
        date_to: datetime | None = Query(default=None),
        amount_min: Decimal | None = Query(default=None, ge=0),
        amount_max: Decimal | None = Query(default=None, ge=0),
        debit_min: Decimal | None = Query(default=None, ge=0),
        debit_max: Decimal | None = Query(default=None, ge=0),
        credit_min: Decimal | None = Query(default=None, ge=0),
        credit_max: Decimal | None = Query(default=None, ge=0),
    ) -> dict[str, Any]:
        return {
            key: value
            for key, value in {
                "organization_id": organization_id,
                "company_id": company_id,
                "account_id": account_id,
                "account_type_id": account_type_id,
                "fiscal_year_id": fiscal_year_id,
                "fiscal_period_id": fiscal_period_id,
                "cost_center_id": cost_center_id,
                "currency_id": currency_id,
                "customer_id": customer_id,
                "supplier_id": supplier_id,
                "invoice_id": invoice_id,
                "payment_id": payment_id,
                "vendor_bill_id": vendor_bill_id,
                "expense_id": expense_id,
                "asset_id": asset_id,
                "bank_account_id": bank_account_id,
                "source_type": source_type,
                "source_id": source_id,
                "transaction_type": transaction_type,
                "is_reconciled": is_reconciled,
                "date_from": date_from,
                "date_to": date_to,
                "amount_min": amount_min,
                "amount_max": amount_max,
                "debit_min": debit_min,
                "debit_max": debit_max,
                "credit_min": credit_min,
                "credit_max": credit_max,
            }.items()
            if value is not None
        }

    @router.get("/", response_model=list_response, summary=f"List {entity_label}")
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
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.read", *manager_permissions)),
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

    @router.post("/", response_model=single_response, status_code=status.HTTP_201_CREATED, summary=f"Create {entity_label}")
    def create_item(
        data: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.create", *manager_permissions)),
    ):
        item = service.create(db, data, current_user.id)
        return APIResponse(message=f"{entity_label} created successfully", data=item)

    @router.post("/bulk-delete", summary=f"Bulk delete {entity_label}")
    def bulk_delete(
        data: BulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        result = service.bulk_delete(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk deleted successfully", data=result)

    @router.post("/bulk-restore", summary=f"Bulk restore {entity_label}")
    def bulk_restore(
        data: BulkIdsRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_restore(db, data.ids, current_user.id)
        return APIResponse(message=f"{entity_label} bulk restored successfully", data=result)

    @router.patch("/bulk-update", summary=f"Bulk update {entity_label}")
    def bulk_update(
        data: BulkUpdateRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_update(db, data.ids, data.values, current_user.id)
        return APIResponse(message=f"{entity_label} bulk updated successfully", data=result)

    @router.patch("/bulk-status", summary=f"Bulk status update {entity_label}")
    def bulk_status(
        data: BulkStatusRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        result = service.bulk_status(db, data.ids, data.status, current_user.id)
        return APIResponse(message=f"{entity_label} status updated successfully", data=result)

    @router.post("/import", summary=f"Import {entity_label} CSV")
    async def import_csv(
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.create", *manager_permissions)),
    ):
        result = await service.import_csv(db, file, create_schema, current_user.id)
        return APIResponse(message=f"{entity_label} import completed", data=result)

    @router.get("/export", summary=f"Export {entity_label}")
    def export_items(
        export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.read", *manager_permissions)),
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
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.read", *manager_permissions)),
    ):
        del current_user
        item = service.get(db, item_id, include_deleted=include_deleted)
        return APIResponse(message=f"{entity_label} loaded", data=item)

    @router.patch("/{item_id}", response_model=single_response, summary=f"Update {entity_label}")
    def update_item(
        item_id: int,
        data: update_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        item = service.update(db, item_id, data, current_user.id)
        return APIResponse(message=f"{entity_label} updated successfully", data=item)

    @router.delete("/{item_id}", response_model=single_response, summary=f"Soft delete {entity_label}")
    def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        item = service.delete(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} deleted successfully", data=item)

    @router.post("/{item_id}/restore", response_model=single_response, summary=f"Restore {entity_label}")
    def restore_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.update", *manager_permissions)),
    ):
        item = service.restore(db, item_id, current_user.id)
        return APIResponse(message=f"{entity_label} restored successfully", data=item)

    @router.delete("/{item_id}/permanent", summary=f"Permanently delete {entity_label}")
    def permanent_delete(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_finance_permission(f"{permission_prefix}.delete", *manager_permissions)),
    ):
        del current_user
        result = service.permanent_delete(db, item_id)
        return APIResponse(message=f"{entity_label} permanently deleted", data=result)

    return router
