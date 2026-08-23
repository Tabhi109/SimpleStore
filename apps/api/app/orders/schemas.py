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
    coupon_code: str | None = None
    payment_method: str = Field("COD", pattern="^(COD|ONLINE)$")
    items: list[OrderItemCreateSchema] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_code: str | None = None
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    image_url: str | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    store_id: uuid.UUID
    customer_name: str
    customer_email: EmailStr
    customer_phone: str | None = None
    shipping_address: str | None = None
    subtotal_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    coupon_code: str | None = None
    currency: str
    payment_method: str
    payment_status: str
    status: str
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|processing|completed|cancelled)$")


class InvoiceStoreDetails(BaseModel):
    name: str
    slug: str
    category: str | None = None
    tagline: str | None = None
    currency: str


class InvoiceResponse(BaseModel):
    invoice_number: str
    order: OrderResponse
    store: InvoiceStoreDetails
    issued_at: datetime
