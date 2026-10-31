"""Database engine, session factory, and connection helpers."""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

connect_args: dict = {}
if settings.uses_neon or "ssl=" in settings.async_database_url:
    connect_args["ssl"] = True
if settings.uses_neon_pooler:
    # Neon pooler (PgBouncer) cannot share asyncpg prepared-statement caches.
    connect_args["statement_cache_size"] = 0

# Serverless hosts open one short-lived instance per request burst.
# A large pool exhausts Neon's connection limit.
on_vercel = bool(os.getenv("VERCEL"))
if on_vercel:
    pool_size = 1
    max_overflow = 0
elif settings.uses_neon:
    pool_size = 5
    max_overflow = 10
else:
    pool_size = 10
    max_overflow = 20

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG and settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,
    pool_size=pool_size,
    max_overflow=max_overflow,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
