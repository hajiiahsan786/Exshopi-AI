import pytest
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentCategory, DocumentFolder, DocumentVersion
from app.repositories.document import DocumentRepository, DocumentFolderRepository
from app.schemas.document import DocumentCreate, DocumentFolderCreate

def test_document_model_initialization():
    doc = Document(
        title="Test Doc",
        file_name="test.txt",
        file_type="text/plain",
        file_size=1024,
        storage_path="documents/test.txt",
        storage_provider="local",
        status="active"
    )
    assert doc.title == "Test Doc"
    assert doc.file_name == "test.txt"
    assert doc.status == "active"
