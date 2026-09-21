"""FastAPI Application Main Entrypoint."""

import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.provider import ai_provider
from app.ai.router import router as ai_router
from app.auth.models import User  # noqa: F401
from app.auth.router import router as auth_router
from app.core.config import settings
from app.core.dependencies import get_db, get_redis
from app.coupons.models import Coupon  # noqa: F401
from app.coupons.router import router as coupons_router
from app.database.base import Base
from app.database.session import engine
from app.middleware.cors import setup_middleware
from app.orders.models import Order, OrderItem  # noqa: F401
from app.orders.router import router as orders_router
from app.products.models import Product  # noqa: F401
from app.products.router import router as products_router
from app.storage.router import router as uploads_router
from app.stores.models import Store  # noqa: F401
from app.stores.router import router as stores_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("simplestore")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events (startup & shutdown) with connection retries."""
    logger.info(f"Starting {settings.APP_NAME} in [{settings.ENVIRONMENT}] mode...")

    # Ensure uploads directory exists
    os.makedirs(os.path.join(os.getcwd(), "uploads"), exist_ok=True)

    # Retry database connection & create schema if needed
    max_retries = 5
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                await conn.execute(text("SELECT 1"))
            logger.info("PostgreSQL database connection pool and schema verified.")
            break
        except Exception as e:
            logger.warning(
                f"Database connection attempt {attempt}/{max_retries} failed: {e}. Retrying in 2s..."
            )
            if attempt < max_retries:
                await asyncio.sleep(2)
            else:
                logger.error("Could not connect to PostgreSQL after multiple attempts.")

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="Your store. Without the complexity. Production-grade Modular Monolith REST API.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Attach Middlewares
setup_middleware(app)

# Static Files for Local Uploads
upload_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Root API v1 Router
api_v1_router = APIRouter(prefix=settings.API_V1_STR)


@api_v1_router.get("/health", tags=["System"])
async def health_check(
    db: AsyncSession = Depends(get_db),
    redis_client: aioredis.Redis = Depends(get_redis),
):
    """Deep system health check inspecting PostgreSQL, Redis, and AI configurations."""
    db_connected = False
    db_latency_ms = None
    redis_connected = False
    redis_latency_ms = None

    # Check Database
    try:
        t0 = time.time()
        await db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - t0) * 1000, 2)
        db_connected = True
    except Exception as e:
        logger.error(f"Health check DB ping failed: {e}")

    # Check Redis
    try:
        t0 = time.time()
        await redis_client.ping()
        redis_latency_ms = round((time.time() - t0) * 1000, 2)
        redis_connected = True
    except Exception as e:
        logger.error(f"Health check Redis ping failed: {e}")

    # Evaluate Overall Status
    is_healthy = db_connected and redis_connected
    system_status = "healthy" if is_healthy else "degraded"

    payload = {
        "status": system_status,
        "version": "0.1.0",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(UTC).isoformat(),
        "database": {
            "connected": db_connected,
            "provider": "Neon Serverless" if settings.uses_neon else "Local PostgreSQL",
            "latency_ms": db_latency_ms,
        },
        "redis": {
            "connected": redis_connected,
            "latency_ms": redis_latency_ms,
        },
        "storage_provider": {
            "type": "Vercel Blob" if settings.BLOB_READ_WRITE_TOKEN else "Local Disk",
            "configured": bool(settings.BLOB_READ_WRITE_TOKEN),
        },
        "ai_provider": {
            "configured": ai_provider.is_configured,
            "provider": "Sarvam AI",
            "model": settings.SARVAM_MODEL,
            "cache": "redis",
        },
    }
    return JSONResponse(content=payload, status_code=200 if is_healthy else 503)


# Mount Routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(stores_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(coupons_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(uploads_router)
api_v1_router.include_router(ai_router)

# Mount API v1 into app
app.include_router(api_v1_router)


@app.get("/", tags=["System"])
async def root():
    """Root status endpoint."""
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
