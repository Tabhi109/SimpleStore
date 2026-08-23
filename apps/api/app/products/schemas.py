"""Pydantic schemas for Product validation and responses."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str | None = Field(None, max_length=255)
    product_code: str | None = Field(None, max_length=64)
    description: str | None = None
    mrp: Decimal | None = Field(None, ge=0)
    price: Decimal = Field(..., ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    inventory: int = Field(0, ge=0)
    inventory_display_limit: int | None = Field(None, ge=0)
    order_limit: int | None = Field(None, ge=0)
    image_url: str | None = None
    images: list[str] | None = None
    is_ai_generated: bool = False
    is_active: bool = True
    published: bool = True


class ProductUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    slug: str | None = Field(None, min_length=1, max_length=255)
    product_code: str | None = Field(None, max_length=64)
    description: str | None = None
    mrp: Decimal | None = Field(None, ge=0)
    price: Decimal | None = Field(None, ge=0)
    currency: str | None = Field(None, min_length=3, max_length=3)
    inventory: int | None = Field(None, ge=0)
    inventory_display_limit: int | None = Field(None, ge=0)
    order_limit: int | None = Field(None, ge=0)
    image_url: str | None = None
    images: list[str] | None = None
    is_active: bool | None = None
    published: bool | None = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    product_code: str | None = None
    name: str
    slug: str
    description: str | None = None
    mrp: Decimal | None = None
    price: Decimal
    currency: str
    inventory: int
    inventory_display_limit: int | None = None
    order_limit: int | None = None
    image_url: str | None = None
    images: list[str] = Field(default_factory=list)
    is_ai_generated: bool = False
    is_active: bool = True
    published: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InventoryItemUpdate(BaseModel):
    product_id: uuid.UUID
    inventory: int = Field(..., ge=0)
    inventory_display_limit: int | None = Field(None, ge=0)
    order_limit: int | None = Field(None, ge=0)


class BatchInventoryUpdateRequest(BaseModel):
    updates: list[InventoryItemUpdate]
