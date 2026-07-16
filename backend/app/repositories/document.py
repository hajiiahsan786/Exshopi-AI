from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.document import (
    Document,
    DocumentFolder,
    DocumentVersion,
    DocumentShare,
    ApprovalWorkflow,
    SignatureRequest,
    DocumentAuditLog
)

class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, document_id: int) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_by_uuid(self, document_uuid: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.uuid == document_uuid).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[Document]:
        return self.db.query(Document).offset(skip).limit(limit).all()

    def create(self, obj_in_data: dict) -> Document:
        db_obj = Document(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Document, obj_in_data: dict) -> Document:
        for field, value in obj_in_data.items():
            setattr(db_obj, field, value)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, document_id: int) -> Document:
        obj = self.db.query(Document).get(document_id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj


class DocumentFolderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, folder_id: int) -> Optional[DocumentFolder]:
        return self.db.query(DocumentFolder).filter(DocumentFolder.id == folder_id).first()

    def create(self, obj_in_data: dict) -> DocumentFolder:
        db_obj = DocumentFolder(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: DocumentFolder, obj_in_data: dict) -> DocumentFolder:
        for field, value in obj_in_data.items():
            setattr(db_obj, field, value)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj


class DocumentVersionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, version_id: int) -> Optional[DocumentVersion]:
        return self.db.query(DocumentVersion).filter(DocumentVersion.id == version_id).first()

    def get_by_document(self, document_id: int) -> List[DocumentVersion]:
        return self.db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).order_by(DocumentVersion.version_number.desc()).all()

    def create(self, obj_in_data: dict) -> DocumentVersion:
        db_obj = DocumentVersion(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj


class DocumentShareRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, share_id: int) -> Optional[DocumentShare]:
        return self.db.query(DocumentShare).filter(DocumentShare.id == share_id).first()

    def get_by_document(self, document_id: int) -> List[DocumentShare]:
        return self.db.query(DocumentShare).filter(DocumentShare.document_id == document_id).all()

    def create(self, obj_in_data: dict) -> DocumentShare:
        db_obj = DocumentShare(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, share_id: int) -> DocumentShare:
        obj = self.db.query(DocumentShare).get(share_id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj


class ApprovalWorkflowRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, workflow_id: int) -> Optional[ApprovalWorkflow]:
        return self.db.query(ApprovalWorkflow).filter(ApprovalWorkflow.id == workflow_id).first()

    def create(self, obj_in_data: dict) -> ApprovalWorkflow:
        db_obj = ApprovalWorkflow(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj


class SignatureRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, request_id: int) -> Optional[SignatureRequest]:
        return self.db.query(SignatureRequest).filter(SignatureRequest.id == request_id).first()

    def create(self, obj_in_data: dict) -> SignatureRequest:
        db_obj = SignatureRequest(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
