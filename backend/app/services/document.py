import os
import uuid
from typing import BinaryIO, Optional
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.document import Document
from app.repositories.document import DocumentRepository
from app.schemas.document import DocumentCreate
from app.services.storage import get_storage_provider


class DocumentService:
    def __init__(self, db: Session, repository: DocumentRepository):
        self.db = db
        self.repository = repository
        self.storage_provider = get_storage_provider("local")  # Should be loaded from config

    def upload_document(self, file: UploadFile, title: str, description: Optional[str] = None, user_id: Optional[int] = None) -> Document:
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        storage_path = f"documents/{unique_filename}"

        # Upload to storage
        final_path = self.storage_provider.upload_file(file.file, storage_path)

        # Create DB record
        doc_data = {
            "title": title,
            "description": description,
            "file_name": file.filename,
            "file_type": file.content_type or "application/octet-stream",
            "file_size": file.size or 0,
            "storage_path": final_path,
            "storage_provider": "local",
            "created_by": user_id
        }

        return self.repository.create(doc_data)

    def download_document(self, document_id: int) -> Optional[BinaryIO]:
        doc = self.repository.get(document_id)
        if not doc:
            return None

        return self.storage_provider.download_file(doc.storage_path)

    def delete_document(self, document_id: int, user_id: Optional[int] = None) -> bool:
        doc = self.repository.get(document_id)
        if not doc:
            return False

        # Optional: Soft delete could be implemented here instead of hard delete
        # self.repository.update(doc, {"status": "trashed", "deleted_by": user_id})

        self.storage_provider.delete_file(doc.storage_path)
        self.repository.delete(document_id)
        return True


    def create_new_version(self, document_id: int, file: UploadFile, changes_summary: Optional[str] = None, user_id: Optional[int] = None) -> Document:
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        # Save old version record
        old_version = {
            "document_id": doc.id,
            "version_number": len(doc.versions) + 1,
            "file_name": doc.file_name,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "storage_path": doc.storage_path,
            "storage_provider": doc.storage_provider,
            "is_current": False,
            "created_by": user_id
        }

        # We need Version repository to save it properly, but here we can just append to versions or create via model directly.
        from app.models.document import DocumentVersion
        version_obj = DocumentVersion(**old_version)
        self.db.add(version_obj)

        # Upload new file
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        storage_path = f"documents/{unique_filename}"
        final_path = self.storage_provider.upload_file(file.file, storage_path)

        # Update document
        doc_update = {
            "file_name": file.filename,
            "file_type": file.content_type or "application/octet-stream",
            "file_size": file.size or 0,
            "storage_path": final_path,
            "storage_provider": "local",
            "updated_by": user_id
        }
        return self.repository.update(doc, doc_update)

    def restore_version(self, document_id: int, version_id: int, user_id: Optional[int] = None) -> Document:
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        from app.models.document import DocumentVersion
        version = self.db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()
        if not version or version.document_id != document_id:
            raise ValueError("Version not found")

        # Update document to use version's file
        doc_update = {
            "file_name": version.file_name,
            "file_type": version.file_type,
            "file_size": version.file_size,
            "storage_path": version.storage_path,
            "storage_provider": version.storage_provider,
            "updated_by": user_id
        }
        return self.repository.update(doc, doc_update)

    def archive_document(self, document_id: int, reason: Optional[str] = None, user_id: Optional[int] = None) -> Document:
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        doc_update = {
            "status": "archived",
            "updated_by": user_id
        }

        from app.models.document import Archive
        archive_record = Archive(
            document_id=doc.id,
            archived_by=user_id,
            reason=reason,
            storage_path=doc.storage_path
        )
        self.db.add(archive_record)

        return self.repository.update(doc, doc_update)

    def restore_from_archive(self, document_id: int, user_id: Optional[int] = None) -> Document:
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        if doc.status != "archived":
            raise ValueError("Document is not archived")

        doc_update = {
            "status": "active",
            "updated_by": user_id
        }

        from app.models.document import RestoreHistory
        restore_record = RestoreHistory(
            document_id=doc.id,
            restored_by=user_id,
            restored_from="archive"
        )
        self.db.add(restore_record)

        return self.repository.update(doc, doc_update)

    def share_document(self, document_id: int, shared_by_user_id: int, shared_with_email: str, permission_level: str = "read", expires_at: Optional[str] = None) -> "DocumentShare":
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        from app.models.document import DocumentShare
        from app.models.user import User

        shared_with_user = self.db.query(User).filter(User.email == shared_with_email).first()
        shared_with_id = shared_with_user.id if shared_with_user else None

        access_token = str(uuid.uuid4())

        share_obj = DocumentShare(
            document_id=doc.id,
            shared_by=shared_by_user_id,
            shared_with_user_id=shared_with_id,
            shared_with_email=shared_with_email,
            permission_level=permission_level,
            expires_at=expires_at,
            access_token=access_token
        )
        self.db.add(share_obj)
        self.db.commit()
        self.db.refresh(share_obj)

        return share_obj


    def create_approval_workflow(self, document_id: int, name: str, approver_ids: list[int], user_id: Optional[int] = None) -> "ApprovalWorkflow":
        doc = self.repository.get(document_id)
        if not doc:
            raise ValueError("Document not found")

        from app.models.document import ApprovalWorkflow, ApprovalStep

        workflow = ApprovalWorkflow(
            document_id=doc.id,
            name=name,
            status="pending",
            created_by=user_id
        )
        self.db.add(workflow)
        self.db.commit()
        self.db.refresh(workflow)

        for idx, approver_id in enumerate(approver_ids):
            step = ApprovalStep(
                workflow_id=workflow.id,
                approver_id=approver_id,
                step_order=idx + 1,
                status="pending",
                created_by=user_id
            )
            self.db.add(step)

        self.db.commit()
        return workflow

    def approve_document(self, step_id: int, user_id: int, comments: Optional[str] = None) -> "ApprovalStep":
        from app.models.document import ApprovalStep, ApprovalHistory, ApprovalWorkflow

        step = self.db.query(ApprovalStep).filter(ApprovalStep.id == step_id).first()
        if not step:
            raise ValueError("Approval step not found")

        if step.approver_id != user_id:
            raise ValueError("Not authorized to approve this step")

        if step.status != "pending":
            raise ValueError("Step already processed")

        step.status = "approved"
        step.comments = comments
        from sqlalchemy.sql import func
        step.action_date = func.now()

        history = ApprovalHistory(
            step_id=step.id,
            action="approved",
            comments=comments,
            created_by=user_id
        )
        self.db.add(history)

        # Check if workflow is complete
        workflow = self.db.query(ApprovalWorkflow).filter(ApprovalWorkflow.id == step.workflow_id).first()
        all_steps = self.db.query(ApprovalStep).filter(ApprovalStep.workflow_id == workflow.id).all()
        if all(s.status == "approved" for s in all_steps):
            workflow.status = "approved"

        self.db.commit()
        self.db.refresh(step)
        return step
