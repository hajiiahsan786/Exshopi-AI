from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse
from app.security.manufacturing_permissions import require_manufacturing_permission

def create_manufacturing_router(
    *,
    service: type[Any],
    create_schema: type[Any],
    update_schema: type[Any],
    single_response: type[Any],
    list_response: type[Any],
    permission_prefix: str,
    entity_label: str,
) -> APIRouter:
    router = APIRouter()

    def list_filters(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        search: str | None = Query(None),
        sort_by: str | None = Query(None),
        sort_desc: bool = Query(False),
    ) -> dict[str, Any]:
        return {
            "skip": skip,
            "limit": limit,
            "search": search,
            "sort_by": sort_by,
            "sort_desc": sort_desc,
        }

    @router.get(
        "",
        response_model=APIResponse[list_response],
        dependencies=[Depends(require_manufacturing_permission(f"{permission_prefix}.read"))],
    )
    def read_entities(
        filters: dict[str, Any] = Depends(list_filters),
        db: Session = Depends(get_db),
    ) -> Any:
        items = service.get_list(db, **filters)
        total = service.count(db, **filters)
        return {
            "success": True,
            "message": f"{entity_label} retrieved successfully",
            "data": items,
            "meta": {"total": total, "skip": filters["skip"], "limit": filters["limit"]},
        }

    @router.post(
        "",
        response_model=APIResponse[single_response],
        status_code=status.HTTP_201_CREATED,
    )
    def create_entity(
        item_in: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_manufacturing_permission(f"{permission_prefix}.create")),
    ) -> Any:
        item = service.create(db, obj_in=item_in, current_user=current_user)
        return {
            "success": True,
            "message": f"{entity_label} created successfully",
            "data": item,
        }

    @router.get(
        "/{item_id}",
        response_model=APIResponse[single_response],
        dependencies=[Depends(require_manufacturing_permission(f"{permission_prefix}.read"))],
    )
    def read_entity(item_id: str, db: Session = Depends(get_db)) -> Any:
        item = service.get(db, id=item_id)
        return {
            "success": True,
            "message": f"{entity_label} retrieved successfully",
            "data": item,
        }

    @router.put(
        "/{item_id}",
        response_model=APIResponse[single_response],
    )
    def update_entity(
        item_id: str,
        item_in: update_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_manufacturing_permission(f"{permission_prefix}.update")),
    ) -> Any:
        item = service.update(db, db_obj=service.get(db, id=item_id), obj_in=item_in, current_user=current_user)
        return {
            "success": True,
            "message": f"{entity_label} updated successfully",
            "data": item,
        }

    @router.delete(
        "/{item_id}",
        response_model=APIResponse[None],
    )
    def delete_entity(
        item_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_manufacturing_permission(f"{permission_prefix}.delete")),
    ) -> Any:
        service.delete(db, id=item_id, current_user=current_user)
        return {
            "success": True,
            "message": f"{entity_label} deleted successfully",
            "data": None,
        }

    return router
