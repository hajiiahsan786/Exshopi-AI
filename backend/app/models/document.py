import uuid as uuid_lib

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

class DocumentCategory(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)

    parent = relationship("DocumentCategory", remote_side=[id], back_populates="children")
    children = relationship("DocumentCategory", back_populates="parent")
    documents = relationship("Document", back_populates="category")


class DocumentFolder(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)

    parent = relationship("DocumentFolder", remote_side=[id], back_populates="children")
    children = relationship("DocumentFolder", back_populates="parent")
    documents = relationship("Document", back_populates="folder")
    permissions = relationship("FolderPermission", back_populates="folder", cascade="all, delete-orphan")


class FolderPermission(Base, AuditMixin, UUIDMixin):
    __tablename__ = "folder_permissions"

    id = Column(Integer, primary_key=True, index=True)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    can_read = Column(Boolean, default=True)
    can_write = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)

    folder = relationship("DocumentFolder", back_populates="permissions")
    role = relationship("Role")
    user = relationship("User", foreign_keys=[user_id])


class Document(Base, AuditMixin, UUIDMixin):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    storage_path = Column(String(1024), nullable=False)
    storage_provider = Column(String(50), nullable=False, default="local")
    is_locked = Column(Boolean, default=False)
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    locked_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="active")  # active, archived, trashed, pending_approval

    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)

    category = relationship("DocumentCategory", back_populates="documents")
    folder = relationship("DocumentFolder", back_populates="documents")
    locking_user = relationship("User", foreign_keys=[locked_by])

    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    revisions = relationship("DocumentRevision", back_populates="document", cascade="all, delete-orphan")
    metadata_entries = relationship("DocumentMetadata", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(1024), nullable=False)
    storage_provider = Column(String(50), nullable=False)
    changes_summary = Column(Text, nullable=True)
    is_current = Column(Boolean, default=False)

    document = relationship("Document", back_populates="versions")


class DocumentRevision(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_revisions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    revision_name = Column(String(255), nullable=False)
    comments = Column(Text, nullable=True)

    document = relationship("Document", back_populates="revisions")


class DocumentMetadata(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_metadata"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(Text, nullable=True)
    metadata_type = Column(String(50), nullable=True)  # string, integer, date, boolean

    document = relationship("Document", back_populates="metadata_entries")


class DocumentTag(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_tags"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    name = Column(String(50), nullable=False)

    document = relationship("Document", backref="tags")


class DocumentComment(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_comments"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)

    document = relationship("Document", backref="comments")
    user = relationship("User", foreign_keys=[user_id])


class DocumentAttachment(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_attachments"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(1024), nullable=False)

    document = relationship("Document", backref="attachments")


class DocumentShare(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_shares"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    shared_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shared_with_email = Column(String(255), nullable=True)
    permission_level = Column(String(50), nullable=False, default="read") # read, write
    expires_at = Column(DateTime(timezone=True), nullable=True)
    access_token = Column(String(255), nullable=True, unique=True)

    document = relationship("Document", backref="shares")
    shared_by_user = relationship("User", foreign_keys=[shared_by])
    shared_with_user = relationship("User", foreign_keys=[shared_with_user_id])


class DocumentPermission(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_permissions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    can_read = Column(Boolean, default=True)
    can_write = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)

    document = relationship("Document", backref="permissions")
    role = relationship("Role")
    user = relationship("User", foreign_keys=[user_id])


class ApprovalWorkflow(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_approval_workflows"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, in_progress, approved, rejected, cancelled

    document = relationship("Document", backref="approval_workflows")
    steps = relationship("ApprovalStep", back_populates="workflow", cascade="all, delete-orphan", order_by="ApprovalStep.step_order")


class ApprovalStep(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_approval_steps"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("document_approval_workflows.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, approved, rejected
    comments = Column(Text, nullable=True)
    action_date = Column(DateTime(timezone=True), nullable=True)

    workflow = relationship("ApprovalWorkflow", back_populates="steps")
    approver = relationship("User", foreign_keys=[approver_id])
    history = relationship("ApprovalHistory", back_populates="step", cascade="all, delete-orphan")


class ApprovalHistory(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_approval_history"

    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("document_approval_steps.id"), nullable=False)
    action = Column(String(50), nullable=False) # approved, rejected
    comments = Column(Text, nullable=True)

    step = relationship("ApprovalStep", back_populates="history")

class ElectronicSignature(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_electronic_signatures"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    signature_data = Column(Text, nullable=False) # Base64 encoded signature image or hash
    ip_address = Column(String(50), nullable=True)
    signed_at = Column(DateTime(timezone=True), default=func.now())

    document = relationship("Document", backref="signatures")
    user = relationship("User", foreign_keys=[user_id])


class SignatureRequest(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_signature_requests"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    signer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    signer_email = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending") # pending, signed, declined, cancelled
    expires_at = Column(DateTime(timezone=True), nullable=True)
    access_token = Column(String(255), nullable=True, unique=True)

    document = relationship("Document", backref="signature_requests")
    requester = relationship("User", foreign_keys=[requester_id])
    signer = relationship("User", foreign_keys=[signer_id])
    history = relationship("SignatureHistory", back_populates="request", cascade="all, delete-orphan")


class SignatureHistory(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_signature_history"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("document_signature_requests.id"), nullable=False)
    action = Column(String(50), nullable=False) # viewed, signed, declined
    comments = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)

    request = relationship("SignatureRequest", back_populates="history")


class OCRJob(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_ocr_jobs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, processing, completed, failed
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    document = relationship("Document", backref="ocr_jobs")
    result = relationship("OCRResult", back_populates="job", uselist=False, cascade="all, delete-orphan")


class OCRResult(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_ocr_results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("document_ocr_jobs.id"), nullable=False)
    extracted_text = Column(Text, nullable=False)
    confidence_score = Column(Integer, nullable=True)

    job = relationship("OCRJob", back_populates="result")


class DocumentTemplate(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(1024), nullable=False)
    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)

    category = relationship("DocumentCategory")
    merge_templates = relationship("MergeTemplate", back_populates="template", cascade="all, delete-orphan")


class MergeTemplate(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_merge_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("document_templates.id"), nullable=False)
    entity_type = Column(String(50), nullable=False) # e.g. Customer, Employee
    field_mapping = Column(JSON, nullable=False) # JSON map of template variables to entity fields

    template = relationship("DocumentTemplate", back_populates="merge_templates")


class GeneratedDocument(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_generated"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("document_templates.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)

    template = relationship("DocumentTemplate")
    document = relationship("Document")

class Archive(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_archives"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    archived_at = Column(DateTime(timezone=True), default=func.now())
    archived_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    storage_path = Column(String(1024), nullable=False) # may move to cheaper storage

    document = relationship("Document", backref="archives")
    archiver = relationship("User", foreign_keys=[archived_by])


class ArchivePolicy(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_archive_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)
    archive_after_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)


class RetentionPolicy(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_retention_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("document_categories.id"), nullable=True)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)
    retain_for_days = Column(Integer, nullable=False)
    action_after_retention = Column(String(50), nullable=False) # delete, archive
    is_active = Column(Boolean, default=True)


class Trash(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_trash"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    deleted_at = Column(DateTime(timezone=True), default=func.now())
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    will_permanently_delete_at = Column(DateTime(timezone=True), nullable=False)

    document = relationship("Document", backref="trash_entries")
    deleter = relationship("User", foreign_keys=[deleted_by])


class RestoreHistory(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_restore_history"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    restored_at = Column(DateTime(timezone=True), default=func.now())
    restored_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    restored_from = Column(String(50), nullable=False) # trash, archive

    document = relationship("Document", backref="restore_history")
    restorer = relationship("User", foreign_keys=[restored_by])


class DocumentAuditLog(Base, AuditMixin, UUIDMixin):
    __tablename__ = "document_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False) # create, update, delete, read, download, share, etc
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)

    document = relationship("Document", backref="audit_logs")
    user = relationship("User", foreign_keys=[user_id])
