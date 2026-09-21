"""Upload service: Vercel Blob when configured, otherwise local disk in development."""

import os
import re
import uuid

import httpx
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


class StorageService:
    """Handles merchant media uploads."""

    @property
    def uses_vercel_blob(self) -> bool:
        return bool(settings.BLOB_READ_WRITE_TOKEN)

    async def upload_image(self, file: UploadFile) -> dict:
        content_type = (file.content_type or "").split(";")[0].strip().lower()
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPEG, PNG, WebP, and GIF images are allowed.",
            )

        data = await file.read()
        if not data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file.")
        if len(data) > settings.UPLOAD_MAX_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File exceeds the 8MB upload limit.",
            )

        original = file.filename or "upload"
        safe_stem = re.sub(r"[^a-zA-Z0-9._-]", "-", os.path.splitext(original)[0])[:40] or "image"
        pathname = f"uploads/{uuid.uuid4().hex}-{safe_stem}{ALLOWED_CONTENT_TYPES[content_type]}"

        if self.uses_vercel_blob:
            return await self._upload_vercel_blob(pathname, data, content_type)
        return await self._upload_local(pathname, data, content_type)

    async def _upload_vercel_blob(self, pathname: str, data: bytes, content_type: str) -> dict:
        token = settings.BLOB_READ_WRITE_TOKEN
        url = f"https://blob.vercel-storage.com/{pathname}"
        headers = {
            "Authorization": f"Bearer {token}",
            "x-api-version": "7",
            "x-content-type": content_type,
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.put(url, headers=headers, content=data)
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vercel Blob upload failed.",
            ) from exc

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vercel Blob rejected the upload. Check BLOB_READ_WRITE_TOKEN.",
            )

        payload = response.json()
        return {
            "url": payload.get("url"),
            "pathname": payload.get("pathname", pathname),
            "contentType": payload.get("contentType", content_type),
            "size": len(data),
        }

    async def _upload_local(self, pathname: str, data: bytes, content_type: str) -> dict:
        upload_root = os.path.join(os.getcwd(), "uploads")
        dest = os.path.join(upload_root, os.path.basename(pathname))
        os.makedirs(upload_root, exist_ok=True)
        with open(dest, "wb") as handle:
            handle.write(data)
        public_path = f"/uploads/{os.path.basename(pathname)}"
        base = settings.API_URL.rstrip("/")
        return {
            "url": f"{base}{public_path}",
            "pathname": public_path,
            "contentType": content_type,
            "size": len(data),
        }


storage_service = StorageService()
