"""Pydantic schemas for Coupons."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    discount_type: str = Field("percentage", pattern="^(percentage|fixed)$")
    discount_value: Decimal = Field(..., gt=0)
    min_order_value: Decimal | None = Field(None, ge=0)
    show_in_suggestions: bool = True
    is_active: bool = True


class CouponUpdateRequest(BaseModel):
    is_active: bool | None = None
    discount_type: str | None = Field(None, pattern="^(percentage|fixed)$")
    discount_value: Decimal | None = Field(None, gt=0)
    min_order_value: Decimal | None = Field(None, ge=0)
    show_in_suggestions: bool | None = None


class CouponResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    code: str
    discount_type: str
    discount_value: Decimal
    min_order_value: Decimal | None = None
    show_in_suggestions: bool = True
    usage_count: int = 0
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SuggestedCouponResponse(BaseModel):
    code: str
    discount_type: str
    discount_value: Decimal
    min_order_value: Decimal | None = None


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
