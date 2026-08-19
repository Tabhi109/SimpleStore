"""Pydantic schemas for Product validation and responses."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(..., ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    inventory: int = Field(0, ge=0)
    image_url: str | None = None
    is_ai_generated: bool = False
    published: bool = True


class ProductUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    slug: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(None, ge=0)
    currency: str | None = Field(None, min_length=3, max_length=3)
    inventory: int | None = Field(None, ge=0)
    image_url: str | None = None
    published: bool | None = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    price: Decimal
    currency: str
    inventory: int
    image_url: str | None = None
    is_ai_generated: bool
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
