"""Tests for root status and health check endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Verify root API info endpoint responds with 200."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SimpleStore"
    assert data["status"] == "online"
    assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient):
    """Verify /api/v1/health validates DB and Redis status."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "0.1.0"
    assert data["database"]["connected"] is True
    assert data["redis"]["connected"] is True
    assert "ai_provider" in data
