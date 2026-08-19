"""Pydantic schemas for Store management, themes, and onboarding context."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ThemeConfigSchema(BaseModel):
    archetype: str = "minimal"  # minimal, editorial, warm, bold
    font_pairing: str = "sans"  # sans, serif, mono, rounded
    color_preset: str = "slate"  # slate, indigo, emerald, amber, rose
    enable_dark_mode_toggle: bool = True
    hero_style: str = "centered"


class StoreCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    category: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    currency: str = Field("USD", min_length=3, max_length=3)
    language: str = Field("en", min_length=2, max_length=10)
    theme_config: ThemeConfigSchema | None = None
    onboarding_context: dict[str, Any] | None = None


class StoreUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    category: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    currency: str | None = Field(None, min_length=3, max_length=3)
    language: str | None = Field(None, min_length=2, max_length=10)
    theme_config: ThemeConfigSchema | None = None
    onboarding_context: dict[str, Any] | None = None
    published: bool | None = None


class StoreResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    slug: str
    category: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    currency: str
    language: str
    theme_config: dict[str, Any]
    onboarding_context: dict[str, Any] | None = None
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
