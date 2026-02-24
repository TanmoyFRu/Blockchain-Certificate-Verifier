import io
import os
import shutil
from minio import Minio
from minio.error import S3Error # Import S3Error
from app.config.settings import settings

class MinioService:
    def __init__(self):
        self.bucket = settings.MINIO_BUCKET_NAME
        self.client = None
        self._connect()

    def _connect(self):
        try:
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE
            )
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                print(f"Bucket '{self.bucket}' created")
        except Exception as e:
            print(f"MinIO Connection Warning: {e}")
            self.client = None

    def upload_file(self, file_path: str, object_name: str):
        if not self.client:
            self._connect()
            
        if not self.client:
            try:
                dest_path = os.path.join("storage", self.bucket, object_name)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy(file_path, dest_path)
                print(f"Stored file locally at {dest_path}")
                return object_name
            except Exception as e:
                print(f"Failed local upload: {e}")
                return None

        try:
            self.client.fput_object(
                self.bucket, object_name, file_path
            )
            return object_name
        except Exception as e:
            print(f"Failed to upload file to MinIO: {e}")
            # Reset client on connection error to trigger reconnection attempt next time
            self.client = None
            raise e

    def get_file_url(self, object_name: str) -> str:
        if not self.client:
            self._connect()

        if not self.client:
             return f"http://localhost:8000/storage/{self.bucket}/{object_name}"
        try:
            return self.client.presigned_get_object(self.bucket, object_name)
        except Exception as e:
            print(f"Failed to generate presigned URL: {e}")
            self.client = None # Reset on error
            return ""

minio_service = MinioService()
