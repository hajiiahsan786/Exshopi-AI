from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict

class DocumentCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class DocumentCategoryCreate(DocumentCategoryBase):
    pass

class DocumentCategoryUpdate(DocumentCategoryBase):
    name: Optional[str] = None

class DocumentCategoryResponse(DocumentCategoryBase):
    id: int
    uuid: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DocumentFolderBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class DocumentFolderCreate(DocumentFolderBase):
    pass

class DocumentFolderUpdate(DocumentFolderBase):
    name: Optional[str] = None

class DocumentFolderResponse(DocumentFolderBase):
    id: int
    uuid: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    file_name: str
    file_type: str
    file_size: int
    category_id: Optional[int] = None
    folder_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    folder_id: Optional[int] = None
    is_locked: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: int
    uuid: str
    storage_path: str
    storage_provider: str
    is_locked: bool
    locked_by: Optional[int] = None
    locked_at: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DocumentVersionBase(BaseModel):
    version_number: int
    file_name: str
    file_type: str
    file_size: int
    changes_summary: Optional[str] = None
    is_current: bool

class DocumentVersionCreate(DocumentVersionBase):
    document_id: int

class DocumentVersionUpdate(BaseModel):
    is_current: Optional[bool] = None
    changes_summary: Optional[str] = None

class DocumentVersionResponse(DocumentVersionBase):
    id: int
    uuid: str
    document_id: int
    storage_path: str
    storage_provider: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentShareBase(BaseModel):
    document_id: int
    shared_with_user_id: Optional[int] = None
    shared_with_email: Optional[str] = None
    permission_level: str = "read"
    expires_at: Optional[datetime] = None

class DocumentShareCreate(DocumentShareBase):
    pass

class DocumentShareUpdate(BaseModel):
    permission_level: Optional[str] = None
    expires_at: Optional[datetime] = None

class DocumentShareResponse(DocumentShareBase):
    id: int
    uuid: str
    shared_by: int
    access_token: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ApprovalWorkflowBase(BaseModel):
    document_id: int
    name: str

class ApprovalWorkflowCreate(ApprovalWorkflowBase):
    pass

class ApprovalWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

class ApprovalWorkflowResponse(ApprovalWorkflowBase):
    id: int
    uuid: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class SignatureRequestBase(BaseModel):
    document_id: int
    signer_id: Optional[int] = None
    signer_email: Optional[str] = None
    expires_at: Optional[datetime] = None

class SignatureRequestCreate(SignatureRequestBase):
    pass

class SignatureRequestUpdate(BaseModel):
    status: Optional[str] = None

class SignatureRequestResponse(SignatureRequestBase):
    id: int
    uuid: str
    requester_id: int
    status: str
    access_token: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DocumentAuditLogBase(BaseModel):
    document_id: Optional[int] = None
    action: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None

class DocumentAuditLogCreate(DocumentAuditLogBase):
    user_id: Optional[int] = None

class DocumentAuditLogResponse(DocumentAuditLogBase):
    id: int
    uuid: str
    user_id: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
