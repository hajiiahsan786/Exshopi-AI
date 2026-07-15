from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Float, Boolean, Table
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

# Association table for KnowledgeDocument and KnowledgeTag
document_tag_association = Table(
    'knowledge_document_tags', Base.metadata,
    Column('document_id', Integer, ForeignKey('knowledge_documents.id')),
    Column('tag_id', Integer, ForeignKey('knowledge_tags.id'))
)

class KnowledgeSpace(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))

    collections = relationship("KnowledgeCollection", back_populates="space", cascade="all, delete-orphan")


class KnowledgeCollection(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    space_id = Column(Integer, ForeignKey("knowledge_spaces.id"), nullable=False)

    space = relationship("KnowledgeSpace", back_populates="collections")
    folders = relationship("KnowledgeFolder", back_populates="collection", cascade="all, delete-orphan")
    documents = relationship("KnowledgeDocument", back_populates="collection")


class KnowledgeFolder(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("knowledge_folders.id"), nullable=True)
    collection_id = Column(Integer, ForeignKey("knowledge_collections.id"), nullable=False)

    collection = relationship("KnowledgeCollection", back_populates="folders")
    parent = relationship("KnowledgeFolder", remote_side=[id], backref="children")
    documents = relationship("KnowledgeDocument", back_populates="folder")


class KnowledgeDocument(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    document_type = Column(String(50)) # e.g., 'pdf', 'txt', 'markdown'
    metadata_json = Column(JSON, default={})

    collection_id = Column(Integer, ForeignKey("knowledge_collections.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("knowledge_folders.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("knowledge_categories.id"), nullable=True)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"), nullable=True)

    collection = relationship("KnowledgeCollection", back_populates="documents")
    folder = relationship("KnowledgeFolder", back_populates="documents")
    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")
    versions = relationship("KnowledgeVersion", back_populates="document", cascade="all, delete-orphan")
    tags = relationship("KnowledgeTag", secondary=document_tag_association, back_populates="documents")


class KnowledgeChunk(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    metadata_json = Column(JSON, default={})

    document = relationship("KnowledgeDocument", back_populates="chunks")
    embeddings = relationship("Embedding", back_populates="chunk", cascade="all, delete-orphan")

class EmbeddingModel(AuditMixin, UUIDMixin, Base):
    __tablename__ = "embedding_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    model_version = Column(String(50))
    dimension = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    embeddings = relationship("Embedding", back_populates="embedding_model")


class Embedding(AuditMixin, UUIDMixin, Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey("knowledge_chunks.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("embedding_models.id"), nullable=False)
    vector = Column(JSON, nullable=False)  # Storing vector as JSON array for PostgreSQL (or specific pgvector Type if available, but keeping it general for now)

    chunk = relationship("KnowledgeChunk", back_populates="embeddings")
    embedding_model = relationship("EmbeddingModel", back_populates="embeddings")


class VectorIndex(AuditMixin, UUIDMixin, Base):
    __tablename__ = "vector_indices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    index_type = Column(String(50), nullable=False)
    collection_id = Column(Integer, ForeignKey("knowledge_collections.id"), nullable=True)
    space_id = Column(Integer, ForeignKey("knowledge_spaces.id"), nullable=True)
    status = Column(String(50), default="active")


class RetrievalJob(AuditMixin, UUIDMixin, Base):
    __tablename__ = "retrieval_jobs"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    result_json = Column(JSON)
    error_message = Column(Text)


class RetrievalHistory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "retrieval_histories"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(Float)
    results_json = Column(JSON)

class MemoryProfile(AuditMixin, UUIDMixin, Base):
    __tablename__ = "memory_profiles"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # e.g., 'user', 'organization', 'agent'
    entity_id = Column(String(255), nullable=False)
    profile_data = Column(JSON, default={})

    long_term_memories = relationship("LongTermMemory", back_populates="profile", cascade="all, delete-orphan")
    short_term_memories = relationship("ShortTermMemory", back_populates="profile", cascade="all, delete-orphan")
    episodic_memories = relationship("EpisodicMemory", back_populates="profile", cascade="all, delete-orphan")
    semantic_memories = relationship("SemanticMemory", back_populates="profile", cascade="all, delete-orphan")
    working_memories = relationship("WorkingMemory", back_populates="profile", cascade="all, delete-orphan")


class LongTermMemory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "long_term_memories"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    importance = Column(Float, default=1.0)
    context_json = Column(JSON, default={})

    profile = relationship("MemoryProfile", back_populates="long_term_memories")


class ShortTermMemory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "short_term_memories"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    expires_at = Column(Float)
    context_json = Column(JSON, default={})

    profile = relationship("MemoryProfile", back_populates="short_term_memories")


class EpisodicMemory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "episodic_memories"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    event = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False)
    emotions_json = Column(JSON, default={})

    profile = relationship("MemoryProfile", back_populates="episodic_memories")


class SemanticMemory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "semantic_memories"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    concept = Column(String(255), nullable=False)
    definition = Column(Text, nullable=False)
    relationships_json = Column(JSON, default={})

    profile = relationship("MemoryProfile", back_populates="semantic_memories")


class WorkingMemory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "working_memories"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    session_id = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    profile = relationship("MemoryProfile", back_populates="working_memories")


class MemorySnapshot(AuditMixin, UUIDMixin, Base):
    __tablename__ = "memory_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("memory_profiles.id"), nullable=False)
    snapshot_data = Column(JSON, nullable=False)
    description = Column(Text)


class MemoryRelationship(AuditMixin, UUIDMixin, Base):
    __tablename__ = "memory_relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_memory_type = Column(String(50), nullable=False)
    source_memory_id = Column(Integer, nullable=False)
    target_memory_type = Column(String(50), nullable=False)
    target_memory_id = Column(Integer, nullable=False)
    relationship_type = Column(String(100), nullable=False)
    weight = Column(Float, default=1.0)

class KnowledgeTag(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)

    documents = relationship("KnowledgeDocument", secondary=document_tag_association, back_populates="tags")


class KnowledgeCategory(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)


class KnowledgeSource(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(100)) # e.g., 'upload', 'web', 'integration'
    url = Column(String(1024))
    metadata_json = Column(JSON, default={})


class KnowledgeVersion(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("knowledge_documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content_hash = Column(String(255), nullable=False)
    s3_path = Column(String(1024))
    changes_summary = Column(Text)

    document = relationship("KnowledgeDocument", back_populates="versions")


class KnowledgePermission(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_permissions"

    id = Column(Integer, primary_key=True, index=True)
    resource_type = Column(String(50), nullable=False) # e.g., 'space', 'collection', 'document'
    resource_id = Column(Integer, nullable=False)
    entity_type = Column(String(50), nullable=False) # e.g., 'user', 'role', 'group'
    entity_id = Column(Integer, nullable=False)
    permission_level = Column(String(50), nullable=False) # e.g., 'read', 'write', 'admin'


class KnowledgeAuditLog(AuditMixin, UUIDMixin, Base):
    __tablename__ = "knowledge_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    details_json = Column(JSON, default={})
