"""Application configuration and settings using Pydantic Settings."""

import re

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # General
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "SimpleStore"
    API_V1_STR: str = "/api/v1"
    PROJECT_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:8000"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "simplestore_db"
    POSTGRES_USER: str = "simplestore_user"
    POSTGRES_PASSWORD: str = "simplestore_password"

    DATABASE_URL: str | None = None
    DATABASE_SYNC_URL: str | None = None
    NEON_DB_URL: str | None = None

    @computed_field
    def async_database_url(self) -> str:
        if self.NEON_DB_URL:
            # Convert postgresql:// to postgresql+asyncpg:// and normalize query params for asyncpg
            url = self.NEON_DB_URL.strip().strip('"').strip("'")
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif not url.startswith("postgresql+asyncpg://"):
                url = f"postgresql+asyncpg://{url}"

            # Remove unsupported sync query parameters like channel_binding, sslmode for asyncpg
            url = re.sub(r"[?&]channel_binding=[^&]*", "", url)
            url = re.sub(r"[?&]sslmode=[^&]*", "", url)
            # Ensure ssl is preserved or passed cleanly
            if "?" in url and not url.endswith("?"):
                url = f"{url}&ssl=require" if "ssl=" not in url else url
            elif "?" in url and url.endswith("?"):
                url = f"{url}ssl=require"
            else:
                url = f"{url}?ssl=require"
            return url

        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @computed_field
    def sync_database_url(self) -> str:
        if self.NEON_DB_URL:
            url = self.NEON_DB_URL.strip().strip('"').strip("'")
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
            return url

        if self.DATABASE_SYNC_URL:
            return self.DATABASE_SYNC_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    @computed_field
    def computed_redis_url(self) -> str:
        if self.REDIS_HOST in ("redis", "simplestore_redis"):
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        if self.REDIS_URL:
            return self.REDIS_URL
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    # Security & Auth
    JWT_SECRET_KEY: str = "development_jwt_secret_key_super_secure_and_long_enough_for_hs256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Provider (Sarvam AI)
    SARVAM_API_KEY: str = ""
    SARVAM_API_URL: str = "https://api.sarvam.ai"
    SARVAM_MODEL: str = "sarvam-2b"

    # Storage (Vercel Blob / S3 / Local)
    STORAGE_PROVIDER: str = "local"
    BLOB_READ_WRITE_TOKEN: str | None = None
    S3_BUCKET_NAME: str = "simplestore-uploads"
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY_ID: str | None = None
    S3_SECRET_ACCESS_KEY: str | None = None


settings = Settings()
