"""Upload REST API Router."""

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, File, Request, UploadFile, status
from pydantic import BaseModel

from app.auth.models import User
from app.core.config import settings
from app.core.dependencies import (
    enforce_rate_limit,
    get_current_user_optional,
    get_redis,
)
from app.storage.service import storage_service

router = APIRouter(prefix="/uploads", tags=["Uploads"])


class BlobUploadResponse(BaseModel):
    url: str
    pathname: str
    contentType: str
    size: int


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/blob",
    response_model=BlobUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an image to Vercel Blob (or local disk in development)",
)
async def upload_blob(
    request: Request,
    file: UploadFile = File(...),
    redis_client: aioredis.Redis = Depends(get_redis),
    current_user: User | None = Depends(get_current_user_optional),
):
    identifier = str(current_user.id) if current_user else _client_ip(request)
    await enforce_rate_limit(
        redis_client,
        "upload",
        identifier,
        settings.UPLOAD_RATE_LIMIT_PER_HOUR,
    )
    return await storage_service.upload_image(file)
