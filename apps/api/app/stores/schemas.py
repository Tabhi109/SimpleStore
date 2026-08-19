"""Pydantic schemas for Store management, themes, and onboarding context."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PaletteSchema(BaseModel):
    primary: str
    accent: str
    background: str
    surface: str
    text: str
    muted: str


class TypographySchema(BaseModel):
    heading_font: str = "sans"
    body_font: str = "sans"


class LayoutSchema(BaseModel):
    hero_style: str = "centered"
    product_grid_columns: int = 3
    card_style: str = "bordered"


class ThemeConfigSchema(BaseModel):
    archetype: str = "minimal"
    palette: PaletteSchema
    typography: TypographySchema
    layout: LayoutSchema


class StoreCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    category: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    theme_config: ThemeConfigSchema | None = None
    onboarding_context: dict[str, Any] | None = None


class StoreUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    category: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
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
    theme_config: dict[str, Any]
    onboarding_context: dict[str, Any] | None = None
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
