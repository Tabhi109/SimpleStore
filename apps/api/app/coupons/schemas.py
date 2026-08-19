"""Pydantic schemas for Coupons."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    discount_type: str = Field("percentage", pattern="^(percentage|fixed)$")
    discount_value: Decimal = Field(..., gt=0)
    is_active: bool = True


class CouponUpdateRequest(BaseModel):
    is_active: bool | None = None
    discount_value: Decimal | None = Field(None, gt=0)


class CouponResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    code: str
    discount_type: str
    discount_value: Decimal
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ValidateCouponRequest(BaseModel):
    code: str
    cart_total: Decimal = Field(..., ge=0)


class ValidateCouponResponse(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: Decimal
    discount_amount: Decimal
    final_total: Decimal
    message: str | None = None
