import os
import shutil
from abc import ABC, abstractmethod
from typing import BinaryIO, Optional


class StorageProvider(ABC):
    @abstractmethod
    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        pass

    @abstractmethod
    def download_file(self, path: str) -> BinaryIO:
        pass

    @abstractmethod
    def delete_file(self, path: str) -> bool:
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = "storage"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        full_path = os.path.join(self.base_dir, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)
        return full_path

    def download_file(self, path: str) -> BinaryIO:
        full_path = os.path.join(self.base_dir, path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"File not found: {path}")
        return open(full_path, "rb")

    def delete_file(self, path: str) -> bool:
        full_path = os.path.join(self.base_dir, path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False


class S3StorageProvider(StorageProvider):
    def __init__(self, bucket_name: str, region_name: str, access_key: str, secret_key: str):
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.access_key = access_key
        self.secret_key = secret_key

    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        # Mock implementation for S3
        return f"s3://{self.bucket_name}/{path}"

    def download_file(self, path: str) -> BinaryIO:
        # Mock implementation for S3
        raise NotImplementedError("S3 download_file is not implemented yet.")

    def delete_file(self, path: str) -> bool:
        # Mock implementation for S3
        return True


class AzureStorageProvider(StorageProvider):
    def __init__(self, connection_string: str, container_name: str):
        self.connection_string = connection_string
        self.container_name = container_name

    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        # Mock implementation for Azure
        return f"azure://{self.container_name}/{path}"

    def download_file(self, path: str) -> BinaryIO:
        # Mock implementation for Azure
        raise NotImplementedError("Azure download_file is not implemented yet.")

    def delete_file(self, path: str) -> bool:
        # Mock implementation for Azure
        return True


class GCSStorageProvider(StorageProvider):
    def __init__(self, bucket_name: str, credentials_path: str):
        self.bucket_name = bucket_name
        self.credentials_path = credentials_path

    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        # Mock implementation for GCS
        return f"gs://{self.bucket_name}/{path}"

    def download_file(self, path: str) -> BinaryIO:
        # Mock implementation for GCS
        raise NotImplementedError("GCS download_file is not implemented yet.")

    def delete_file(self, path: str) -> bool:
        # Mock implementation for GCS
        return True


class MinIOStorageProvider(S3StorageProvider):
    def __init__(self, endpoint: str, bucket_name: str, access_key: str, secret_key: str):
        super().__init__(bucket_name, "us-east-1", access_key, secret_key)
        self.endpoint = endpoint

    def upload_file(self, file_obj: BinaryIO, path: str) -> str:
        # Mock implementation for MinIO
        return f"minio://{self.bucket_name}/{path}"


def get_storage_provider(provider_type: str = "local") -> StorageProvider:
    if provider_type == "local":
        return LocalStorageProvider()
    elif provider_type == "s3":
        return S3StorageProvider("my-bucket", "us-east-1", "mock_key", "mock_secret")
    elif provider_type == "azure":
        return AzureStorageProvider("mock_connection", "mock-container")
    elif provider_type == "gcs":
        return GCSStorageProvider("my-bucket", "/path/to/creds.json")
    elif provider_type == "minio":
        return MinIOStorageProvider("http://localhost:9000", "my-bucket", "mock_key", "mock_secret")
    else:
        raise ValueError(f"Unknown storage provider type: {provider_type}")
