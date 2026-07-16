from collections.abc import Iterable
from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from sqlalchemy import String, asc, cast, desc, func, or_
from sqlalchemy.orm import Query, Session

ModelT = TypeVar("ModelT")


class CRMRepository(Generic[ModelT]):
    model: type[ModelT]
    search_fields: tuple[str, ...] = ()
    tag_field: str | None = None
    sortable_fields: set[str] = {
        "id",
        "created_at",
        "updated_at",
        "status",
        "first_name",
        "last_name",
        "full_name",
        "email",
        "phone",
        "company",
        "title",
        "due_date",
        "activity_at",
    }

    @classmethod
    def base_query(cls, db: Session, include_deleted: bool = False) -> Query:
        query = db.query(cls.model)
        if not include_deleted and hasattr(cls.model, "deleted_at"):
            query = query.filter(cls.model.deleted_at.is_(None))
        return query

    @classmethod
    def get_by_id(
        cls,
        db: Session,
        item_id: int,
        include_deleted: bool = False,
    ) -> ModelT | None:
        return cls.base_query(db, include_deleted).filter(cls.model.id == item_id).first()

    @classmethod
    def get_by_field(
        cls,
        db: Session,
        field_name: str,
        value: Any,
        exclude_id: int | None = None,
        include_deleted: bool = False,
    ) -> ModelT | None:
        field = getattr(cls.model, field_name)
        query = cls.base_query(db, include_deleted).filter(field == value)
        if exclude_id is not None:
            query = query.filter(cls.model.id != exclude_id)
        return query.first()

    @classmethod
    def list(
        cls,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        tags: str | None = None,
        filters: dict[str, Any] | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        include_deleted: bool = False,
    ) -> tuple[list[ModelT], int]:
        query = cls.base_query(db, include_deleted)

        if filters:
            for field_name, value in filters.items():
                if value is not None and hasattr(cls.model, field_name):
                    query = query.filter(getattr(cls.model, field_name) == value)

        if status and hasattr(cls.model, "status"):
            query = query.filter(cls.model.status == status)

        if search:
            pattern = f"%{search}%"
            clauses = []
            for field_name in cls.search_fields:
                if hasattr(cls.model, field_name):
                    clauses.append(getattr(cls.model, field_name).ilike(pattern))
            if clauses:
                query = query.filter(or_(*clauses))

        if tags and cls.tag_field and hasattr(cls.model, cls.tag_field):
            query = query.filter(cast(getattr(cls.model, cls.tag_field), String).ilike(f"%{tags}%"))

        total = query.with_entities(func.count(cls.model.id)).scalar() or 0

        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(cls.model, order_field_name, cls.model.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total

    @classmethod
    def create(cls, db: Session, data: dict[str, Any], user_id: int | None = None) -> ModelT:
        if user_id and hasattr(cls.model, "created_by"):
            data["created_by"] = user_id
        item = cls.model(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def update(
        cls,
        db: Session,
        item: ModelT,
        data: dict[str, Any],
        user_id: int | None = None,
    ) -> ModelT:
        for key, value in data.items():
            setattr(item, key, value)
        if user_id and hasattr(item, "updated_by"):
            item.updated_by = user_id
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def soft_delete(cls, db: Session, item: ModelT, user_id: int | None = None) -> ModelT:
        item.deleted_at = datetime.now(timezone.utc)
        item.deleted_by = user_id
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def restore(cls, db: Session, item: ModelT, user_id: int | None = None) -> ModelT:
        item.restore()
        if user_id and hasattr(item, "updated_by"):
            item.updated_by = user_id
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def hard_delete(cls, db: Session, item: ModelT) -> None:
        db.delete(item)
        db.commit()

    @staticmethod
    def to_dict(data: Any, exclude_unset: bool = False) -> dict[str, Any]:
        if hasattr(data, "model_dump"):
            return data.model_dump(exclude_unset=exclude_unset)
        return dict(data)

    @staticmethod
    def has_any(values: Iterable[Any]) -> bool:
        return any(value is not None for value in values)
