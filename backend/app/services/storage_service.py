import os
from app.config.settings import settings
from app.services.minio_service import minio_service

class StorageService:
    def __init__(self):
        self.use_minio = bool(settings.MINIO_ENDPOINT)

    def upload_file(self, filepath: str, object_name: str) -> str:
        if self.use_minio:
            try:
                minio_service.upload_file(filepath, object_name)
                return object_name
            except Exception as e:
                print(f"MinIO storage failed: {e}. Falling back to local.")
        
        dest_path = os.path.join("storage", object_name.replace("certs/", ""))
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(filepath, "rb") as src, open(dest_path, "wb") as dst:
            dst.write(src.read())
        return dest_path

    def get_file_url(self, storage_url: str) -> str:
        if self.use_minio and storage_url.startswith("certs/"):
            try:
                return minio_service.get_file_url(storage_url)
            except Exception:
                pass
        
        filename = os.path.basename(storage_url)
        return f"/storage/{filename}"

storage_service = StorageService()
