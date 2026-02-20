from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    RPC_URL: str = ""
    PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    # MinIO Configuration
    MINIO_ENDPOINT: str = "play.min.io:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "certificates"
    MINIO_SECURE: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
