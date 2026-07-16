import csv
import io
import zipfile
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any, List, Dict
from xml.sax.saxutils import escape

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.employee import (
    Employee,
    JobPosition,
    Attendance,
    LeaveRequest,
    Payroll,
    JobApplication,
    PerformanceReview,
    TrainingRecord,
    ShiftSchedule,
    Timesheet,
    EmployeeDocument,
    EmployeeAsset,
)
from app.repositories.employee_repository import (
    EmployeeRepository,
    JobPositionRepository,
    AttendanceRepository,
    LeaveRequestRepository,
    PayrollRepository,
    JobApplicationRepository,
    PerformanceReviewRepository,
    TrainingRecordRepository,
    ShiftScheduleRepository,
    TimesheetRepository,
    EmployeeDocumentRepository,
    EmployeeAssetRepository,
)
from app.schemas.crm_common import PaginatedResponse


def normalize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {key: (None if value == "" else value) for key, value in payload.items()}


def serialize_export_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    return str(value)


def column_name(index: int) -> str:
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def build_xlsx(rows: List[Dict[str, Any]], fields: tuple[str, ...]) -> bytes:
    sheet_rows = [list(fields)]
    sheet_rows.extend([[serialize_export_value(row.get(field)) for field in fields] for row in rows])
    cells = []
    for row_index, row in enumerate(sheet_rows, start=1):
        row_cells = []
        for column_index, value in enumerate(row, start=1):
            coordinate = f"{column_name(column_index)}{row_index}"
            row_cells.append(f'<c r="{coordinate}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>')
        cells.append(f'<row r="{row_index}">{"".join(row_cells)}</row>')

    sheet_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"<sheetData>{''.join(cells)}</sheetData>"
        "</worksheet>"
    )
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as workbook:
        workbook.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            "</Types>",
        )
        workbook.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/>'
            "</Relationships>",
        )
        workbook.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="HR Export" sheetId="1" r:id="rId1"/></sheets>'
            "</workbook>",
        )
        workbook.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            'Target="worksheets/sheet1.xml"/>'
            "</Relationships>",
        )
        workbook.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    return output.getvalue()


class BaseHRService:
    repository: type[Any]
    entity_name = "HR Entity"
    export_fields: tuple[str, ...] = ("id", "uuid", "status", "created_at", "updated_at")

    @classmethod
    def list(cls, db: Session, **params: Any) -> PaginatedResponse:
        items, total = cls.repository.list(db, **params)
        page = params.get("page", 1)
        page_size = params.get("page_size", 20)
        pages = (total + page_size - 1) // page_size if total else 0
        return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)

    @classmethod
    def get(cls, db: Session, item_id: int, include_deleted: bool = False) -> Any:
        item = cls.repository.get_by_id(db, item_id, include_deleted=include_deleted)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": f"{cls.entity_name} not found", "errors": {"id": item_id}},
            )
        return item

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.validate_payload(db, payload)
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        item = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.validate_payload(db, payload, item=item)
        return cls.repository.update(db, item, payload, user_id)

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.soft_delete(db, cls.get(db, item_id), user_id)

    @classmethod
    def restore(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.restore(db, cls.get(db, item_id, include_deleted=True), user_id)

    @classmethod
    def permanent_delete(cls, db: Session, item_id: int) -> Dict[str, int]:
        item = cls.get(db, item_id, include_deleted=True)
        cls.repository.hard_delete(db, item)
        return {"deleted": item_id}

    @classmethod
    def bulk_delete(cls, db: Session, ids: List[int], user_id: int | None = None) -> Dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        for item in items:
            cls.repository.soft_delete(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_restore(cls, db: Session, ids: List[int], user_id: int | None = None) -> Dict[str, Any]:
        items = cls.repository.bulk_get(db, ids, include_deleted=True)
        for item in items:
            cls.repository.restore(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_update(cls, db: Session, ids: List[int], values: Dict[str, Any], user_id: int | None = None) -> Dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        allowed_values = {key: value for key, value in values.items() if hasattr(cls.repository.model, key)}
        for item in items:
            cls.update(db, item.id, allowed_values, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_status(cls, db: Session, ids: List[int], new_status: str, user_id: int | None = None) -> Dict[str, Any]:
        return cls.bulk_update(db, ids, {"status": new_status}, user_id)

    @classmethod
    def export_rows(cls, db: Session, export_format: str = "json") -> Any:
        export_format = export_format.lower()
        items, _ = cls.repository.list(db, page=1, page_size=10000, include_deleted=True)
        rows = []
        for item in items:
            rows.append({field: getattr(item, field, None) for field in cls.export_fields})
        if export_format == "json":
            return rows
        if export_format == "xlsx":
            return build_xlsx(rows, cls.export_fields)
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(cls.export_fields))
        writer.writeheader()
        writer.writerows(rows)
        return output.getvalue()

    @classmethod
    def validate_payload(cls, db: Session, payload: Dict[str, Any], item: Any | None = None) -> None:
        return None

    @classmethod
    async def import_csv(cls, db: Session, file: UploadFile, create_schema: type[Any], user_id: int | None = None) -> Dict[str, Any]:
        raw = await file.read()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        created: List[int] = []
        errors: List[Dict[str, Any]] = []
        for row_number, row in enumerate(reader, start=2):
            try:
                # convert empty strings to None
                cleaned = {k: (None if v == "" else v) for k, v in row.items()}
                data = create_schema(**cleaned)
                item = cls.create(db, data, user_id)
                created.append(item.id)
            except Exception as exc:  # noqa: BLE001
                detail = getattr(exc, "detail", str(exc))
                errors.append({"row": row_number, "error": detail})
        return {"created": len(created), "ids": created, "errors": errors}


class EmployeeService(BaseHRService):
    repository = EmployeeRepository
    entity_name = "Employee"
    export_fields = (
        "id",
        "uuid",
        "first_name",
        "last_name",
        "email",
        "phone",
        "position",
        "status",
        "hire_date",
        "birth_date",
        "gender",
        "salary",
    )

    @classmethod
    def get_org_chart(cls, db: Session) -> List[Dict[str, Any]]:
        # Fetch active/all employees
        employees = db.query(Employee).filter(Employee.deleted_at.is_(None)).all()
        # Build node dictionaries
        emp_nodes = {
            emp.id: {
                "id": emp.id,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "position": emp.position,
                "email": emp.email,
                "subordinates": [],
                "_manager_id": emp.manager_id,
            }
            for emp in employees
        }

        roots = []
        for emp_id, node in emp_nodes.items():
            mgr_id = node.pop("_manager_id")
            if mgr_id and mgr_id in emp_nodes:
                emp_nodes[mgr_id]["subordinates"].append(node)
            else:
                roots.append(node)
        return roots


class JobPositionService(BaseHRService):
    repository = JobPositionRepository
    entity_name = "Job Position"
    export_fields = ("id", "uuid", "title", "description", "requirements", "status")


class AttendanceService(BaseHRService):
    repository = AttendanceRepository
    entity_name = "Attendance"
    export_fields = ("id", "uuid", "employee_id", "date", "check_in", "check_out", "status", "notes")


class LeaveRequestService(BaseHRService):
    repository = LeaveRequestRepository
    entity_name = "Leave Request"
    export_fields = ("id", "uuid", "employee_id", "leave_type", "start_date", "end_date", "status", "reason")


class PayrollService(BaseHRService):
    repository = PayrollRepository
    entity_name = "Payroll"
    export_fields = (
        "id",
        "uuid",
        "employee_id",
        "pay_period_start",
        "pay_period_end",
        "basic_salary",
        "allowances",
        "deductions",
        "net_salary",
        "status",
    )

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        # Net salary logic auto-calculation: basic + allowance - deduction
        basic = Decimal(str(payload.get("basic_salary") or 0.0))
        allowance = Decimal(str(payload.get("allowances") or 0.0))
        deduction = Decimal(str(payload.get("deductions") or 0.0))
        payload["net_salary"] = basic + allowance - deduction
        cls.validate_payload(db, payload)
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        item = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))

        basic = Decimal(str(payload.get("basic_salary") if "basic_salary" in payload else item.basic_salary or 0.0))
        allowance = Decimal(str(payload.get("allowances") if "allowances" in payload else item.allowances or 0.0))
        deduction = Decimal(str(payload.get("deductions") if "deductions" in payload else item.deductions or 0.0))
        payload["net_salary"] = basic + allowance - deduction

        cls.validate_payload(db, payload, item=item)
        return cls.repository.update(db, item, payload, user_id)


class JobApplicationService(BaseHRService):
    repository = JobApplicationRepository
    entity_name = "Job Application"
    export_fields = ("id", "uuid", "candidate_name", "candidate_email", "candidate_phone", "resume_url", "status")


class PerformanceReviewService(BaseHRService):
    repository = PerformanceReviewRepository
    entity_name = "Performance Review"
    export_fields = ("id", "uuid", "employee_id", "reviewer_id", "review_date", "rating", "feedback", "goals", "status")


class TrainingRecordService(BaseHRService):
    repository = TrainingRecordRepository
    entity_name = "Training Record"
    export_fields = ("id", "uuid", "employee_id", "training_name", "provider", "start_date", "end_date", "status", "result")


class ShiftScheduleService(BaseHRService):
    repository = ShiftScheduleRepository
    entity_name = "Shift Schedule"
    export_fields = ("id", "uuid", "employee_id", "start_time", "end_time", "shift_name", "status")


class TimesheetService(BaseHRService):
    repository = TimesheetRepository
    entity_name = "Timesheet"
    export_fields = ("id", "uuid", "employee_id", "date", "hours_worked", "description", "status")


class EmployeeDocumentService(BaseHRService):
    repository = EmployeeDocumentRepository
    entity_name = "Employee Document"
    export_fields = ("id", "uuid", "employee_id", "document_name", "document_type", "document_url", "expiry_date", "status")


class EmployeeAssetService(BaseHRService):
    repository = EmployeeAssetRepository
    entity_name = "Employee Asset"
    export_fields = ("id", "uuid", "employee_id", "asset_name", "asset_type", "serial_number", "assigned_date", "returned_date", "status")
