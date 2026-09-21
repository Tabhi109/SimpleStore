"""FastAPI dependency injection providers."""

import uuid
from collections.abc import AsyncGenerator
from datetime import UTC, datetime

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.core.config import settings
from app.core.security import decode_token
from app.database.session import get_db

security_scheme = HTTPBearer(auto_error=False)

redis_pool = aioredis.ConnectionPool.from_url(
    settings.computed_redis_url,
    decode_responses=True,
    max_connections=20,
)

_redis_client: aioredis.Redis | None = None


def get_redis_client() -> aioredis.Redis:
    """Process-wide Redis client (do not close per request)."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.Redis(connection_pool=redis_pool)
    return _redis_client


async def get_redis() -> AsyncGenerator[aioredis.Redis, None]:
    """Dependency provider for async Redis client."""
    yield get_redis_client()


async def get_current_user_optional(
    auth: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Extract authenticated user if token is provided, otherwise return None."""
    if not auth or not auth.credentials:
        return None

    payload = decode_token(auth.credentials)
    if not payload or payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except (ValueError, TypeError):
        return None

    result = await db.execute(select(User).where(User.id == user_uuid))
    return result.scalar_one_or_none()


async def get_current_user(
    current_user: User | None = Depends(get_current_user_optional),
) -> User:
    """Enforce authenticated user requirement."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or are invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def enforce_rate_limit(
    redis_client: aioredis.Redis,
    bucket: str,
    identifier: str,
    limit: int,
    window_seconds: int = 3600,
) -> None:
    """Increment a Redis window counter and reject when over limit."""
    hour_bucket = datetime.now(UTC).strftime("%Y%m%d%H")
    key = f"ratelimit:{bucket}:{identifier}:{hour_bucket}"
    try:
        count = await redis_client.incr(key)
        if count == 1:
            await redis_client.expire(key, window_seconds)
    except Exception:
        # Fail open if Redis is unavailable so core commerce still works.
        return
    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )


async def enforce_ai_rate_limit(
    request: Request,
    redis_client: aioredis.Redis = Depends(get_redis),
    current_user: User | None = Depends(get_current_user_optional),
) -> User | None:
    identifier = str(current_user.id) if current_user else _client_ip(request)
    limit = (
        settings.AI_RATE_LIMIT_AUTH_PER_HOUR
        if current_user
        else settings.AI_RATE_LIMIT_ANON_PER_HOUR
    )
    await enforce_rate_limit(redis_client, "ai", identifier, limit)
    return current_user
