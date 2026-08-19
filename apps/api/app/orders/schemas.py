"""Pydantic schemas for Order placement and merchant management."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreateSchema(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0)


class OrderCreateRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: EmailStr
    customer_phone: str | None = None
    shipping_address: str | None = None
    items: list[OrderItemCreateSchema] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    customer_name: str
    customer_email: EmailStr
    customer_phone: str | None = None
    shipping_address: str | None = None
    total_amount: Decimal
    currency: str
    status: str
    payment_status: str
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|fulfilled|cancelled)$")
