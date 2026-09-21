"""Application configuration and settings using Pydantic Settings."""

from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from pydantic import computed_field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _strip_url_quotes(url: str) -> str:
    return url.strip().strip('"').strip("'")


def _drop_query_keys(url: str, keys: set[str]) -> str:
    parsed = urlparse(url)
    query = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if k not in keys]
    return urlunparse(parsed._replace(query=urlencode(query)))


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
            url = _strip_url_quotes(self.NEON_DB_URL)
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif not url.startswith("postgresql+asyncpg://"):
                url = f"postgresql+asyncpg://{url}"
            # asyncpg uses connect_args ssl=True; strip libpq-only params
            return _drop_query_keys(url, {"sslmode", "channel_binding", "ssl"})

        if self.DATABASE_URL:
            return _strip_url_quotes(self.DATABASE_URL)
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @computed_field
    def sync_database_url(self) -> str:
        if self.NEON_DB_URL:
            url = _strip_url_quotes(self.NEON_DB_URL)
            if url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url

        if self.DATABASE_SYNC_URL:
            return _strip_url_quotes(self.DATABASE_SYNC_URL)
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @computed_field
    def uses_neon(self) -> bool:
        url = (self.NEON_DB_URL or self.DATABASE_URL or self.async_database_url).lower()
        return "neon.tech" in url or bool(self.NEON_DB_URL)

    @computed_field
    def uses_neon_pooler(self) -> bool:
        return self.uses_neon and "-pooler." in self.async_database_url

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
    SARVAM_API_KEY: str | None = None
    SARVAM_API_URL: str = "https://api.sarvam.ai"
    SARVAM_MODEL: str = "sarvam-2b"
    AI_CACHE_TTL_SECONDS: int = 60 * 60 * 24 * 7
    AI_RATE_LIMIT_AUTH_PER_HOUR: int = 20
    AI_RATE_LIMIT_ANON_PER_HOUR: int = 8

    # Storage (Vercel Blob / Local)
    STORAGE_PROVIDER: str = "local"
    BLOB_READ_WRITE_TOKEN: str | None = None
    S3_BUCKET_NAME: str = "simplestore-uploads"
    S3_REGION: str = "us-east-1"
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY_ID: str | None = None
    S3_SECRET_ACCESS_KEY: str | None = None
    UPLOAD_MAX_BYTES: int = 8 * 1024 * 1024
    UPLOAD_RATE_LIMIT_PER_HOUR: int = 40

    @field_validator("BLOB_READ_WRITE_TOKEN", "NEON_DB_URL", "SARVAM_API_KEY", mode="before")
    @classmethod
    def strip_optional_secrets(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip().strip('"').strip("'")
        return cleaned or None

    @model_validator(mode="after")
    def reject_default_jwt_in_production(self):
        if (
            self.ENVIRONMENT == "production"
            and self.JWT_SECRET_KEY == "development_jwt_secret_key_super_secure_and_long_enough_for_hs256"
        ):
            raise ValueError("JWT_SECRET_KEY must be changed from the development default in production.")
        return self


settings = Settings()
