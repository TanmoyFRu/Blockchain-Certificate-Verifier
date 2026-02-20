from minio import Minio
from app.config.settings import settings
import sys
import os

sys.path.append(os.getcwd())

def test_minio():
    print(f"Connecting to {settings.MINIO_ENDPOINT} (Secure: {settings.MINIO_SECURE})...")
    try:
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        buckets = client.list_buckets()
        print("SUCCESS: Connected to MinIO.")
        print(f"Buckets: {[b.name for b in buckets]}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_minio()
