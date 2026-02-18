from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    RPC_URL: str = ""
    PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
