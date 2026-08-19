"""Middleware configuration for CORS, Security Headers, and Request Logging."""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

logger = logging.getLogger("simplestore.api")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs API request paths, duration, and status codes."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} -> Status {response.status_code} ({process_time:.2f}ms)"
        )
        return response


def setup_middleware(app: FastAPI) -> None:
    """Register all middlewares on the FastAPI application instance."""
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Security Headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Request Logging
    app.add_middleware(RequestLoggingMiddleware)
