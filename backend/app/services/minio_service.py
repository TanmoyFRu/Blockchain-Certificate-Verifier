import io
import os
import shutil
from minio import Minio
from minio.error import S3Error # Import S3Error
from app.config.settings import settings

class MinioService:
    def __init__(self):
        self.bucket = settings.MINIO_BUCKET_NAME
        try:
            self.client = Minio(
                settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE
            )
            # Check if bucket exists
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                print(f"Bucket '{self.bucket}' created") # Added this print statement back
        except Exception as e:
            print(f"MinIO Connection Warning: {e}")
            self.client = None

    # _ensure_bucket_exists method is removed as its logic is integrated into __init__

    def upload_file(self, file_path: str, object_name: str):
        if not self.client:
            # Fallback to local storage
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
        except S3Error as e:
            print(f"Failed to upload file to MinIO: {e}")
            raise e

    def get_file_url(self, object_name: str) -> str:
        """Generates a presigned URL for the object."""
        if not self.client:
             # Return local URL
             return f"http://localhost:8000/storage/{self.bucket}/{object_name}"
        try:
            return self.client.presigned_get_object(self.bucket, object_name)
        except Exception as e:
            print(f"Failed to generate presigned URL: {e}")
            return ""

minio_service = MinioService()
