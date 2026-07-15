from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.repositories.document import DocumentRepository
from app.schemas.document import DocumentResponse
from app.services.document import DocumentService
from app.schemas.document import DocumentFolderCreate, DocumentFolderResponse, DocumentShareResponse

router = APIRouter()

def get_document_service(db: Session = Depends(get_db)) -> DocumentService:
    repository = DocumentRepository(db)
    return DocumentService(db, repository)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Upload a new document.
    """
    try:
        doc = service.upload_document(
            file=file,
            title=title,
            description=description,
            user_id=current_user.id
        )
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Get a document by ID.
    """
    doc = service.repository.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Download a document file.
    """
    doc = service.repository.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_stream = service.download_document(document_id)
    if not file_stream:
        raise HTTPException(status_code=404, detail="File content not found")

    return StreamingResponse(
        file_stream,
        media_type=doc.file_type,
        headers={"Content-Disposition": f"attachment; filename={doc.file_name}"}
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Delete a document.
    """
    success = service.delete_document(document_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return None

@router.post("/{document_id}/versions", response_model=DocumentResponse)
def create_document_version(
    document_id: int,
    file: UploadFile = File(...),
    changes_summary: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Upload a new version of a document.
    """
    try:
        doc = service.create_new_version(
            document_id=document_id,
            file=file,
            changes_summary=changes_summary,
            user_id=current_user.id
        )
        return doc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{document_id}/share", response_model=DocumentShareResponse)
def share_document(
    document_id: int,
    shared_with_email: str = Form(...),
    permission_level: str = Form("read"),
    expires_at: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service)
) -> Any:
    """
    Share a document with another user via email.
    """
    try:
        share_obj = service.share_document(
            document_id=document_id,
            shared_by_user_id=current_user.id,
            shared_with_email=shared_with_email,
            permission_level=permission_level,
            expires_at=expires_at
        )
        return share_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/folders", response_model=DocumentFolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(
    folder_in: DocumentFolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new document folder.
    """
    from app.repositories.document import DocumentFolderRepository
    repo = DocumentFolderRepository(db)
    # inject user for auditing
    data = folder_in.model_dump()
    data["created_by"] = current_user.id
    return repo.create(data)
