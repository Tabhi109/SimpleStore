"""Coupons REST API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.core.dependencies import get_current_user, get_db
from app.coupons.schemas import (
    CouponCreateRequest,
    CouponResponse,
    ValidateCouponRequest,
    ValidateCouponResponse,
)
from app.coupons.service import coupon_service

router = APIRouter(tags=["Coupons"])


@router.post(
    "/stores/{store_id}/coupons",
    response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create coupon code",
)
async def create_coupon(
    store_id: uuid.UUID,
    request: CouponCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a discount coupon."""
    return await coupon_service.create_coupon(db, store_id, current_user.id, request)


@router.get(
    "/stores/{store_id}/coupons",
    response_model=list[CouponResponse],
    summary="List store coupons",
)
async def list_coupons(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List coupons in merchant store."""
    return await coupon_service.get_store_coupons(db, store_id, current_user.id)


@router.post(
    "/stores/{store_id}/coupons/validate",
    response_model=ValidateCouponResponse,
    summary="Validate coupon code for checkout",
)
async def validate_coupon(
    store_id: uuid.UUID,
    request: ValidateCouponRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate a coupon code against a cart total."""
    valid, discount, final_total, msg = await coupon_service.validate_coupon(
        db, store_id, request.code, request.cart_total
    )
    return ValidateCouponResponse(
        valid=valid,
        code=request.code.upper().strip(),
        discount_type="calculated",
        discount_value=discount,
        discount_amount=discount,
        final_total=final_total,
        message=msg,
    )
