"""Middleware configuration for CORS, Security Headers, and Request Logging."""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("simplestore.api")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
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
    # Request Logging (Inner)
    app.add_middleware(RequestLoggingMiddleware)

    # Security Headers (Middle)
    app.add_middleware(SecurityHeadersMiddleware)

    # CORS (Outermost - added last so it processes preflight OPTIONS and response headers first)
    from app.core.config import settings

    origins = settings.BACKEND_CORS_ORIGINS or [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if settings.PROJECT_URL and settings.PROJECT_URL not in origins:
        origins.append(settings.PROJECT_URL)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
