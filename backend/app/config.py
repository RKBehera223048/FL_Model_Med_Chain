"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MedChain-FL Global Server"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./medchain.db"

    # JWT
    SECRET_KEY: str = "medchain-fl-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Default Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@medchain.in"
    DEFAULT_ADMIN_PASSWORD: str = "MedChain@2026"
    DEFAULT_ADMIN_NAME: str = "Global Administrator"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # File uploads
    UPLOAD_DIR: str = "./uploads"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
