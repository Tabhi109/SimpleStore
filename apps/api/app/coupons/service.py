"""Coupon service for discount codes and server-side validation."""

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.coupons.models import Coupon
from app.coupons.schemas import CouponCreateRequest, CouponUpdateRequest
from app.stores.service import store_service


class CouponService:
    """Service for store discounts and promo codes."""

    async def create_coupon(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: CouponCreateRequest,
    ) -> Coupon:
        """Create a coupon code for a store."""
        await store_service.get_store_by_id(db, store_id, owner_id=owner_id)

        clean_code = request.code.upper().strip()
        result = await db.execute(
            select(Coupon).where(Coupon.store_id == store_id, Coupon.code == clean_code)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A coupon with this code already exists for this store.",
            )

        new_coupon = Coupon(
            store_id=store_id,
            code=clean_code,
            discount_type=request.discount_type,
            discount_value=request.discount_value,
            min_order_value=request.min_order_value,
            show_in_suggestions=request.show_in_suggestions,
            is_active=request.is_active,
        )
        db.add(new_coupon)
        await db.commit()
        await db.refresh(new_coupon)
        return new_coupon

    async def get_store_coupons(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> list[Coupon]:
        """List all coupons for a store (Merchant Portal)."""
        await store_service.get_store_by_id(db, store_id, owner_id=owner_id)
        result = await db.execute(
            select(Coupon).where(Coupon.store_id == store_id).order_by(Coupon.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_suggested_coupons(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
    ) -> list[Coupon]:
        """List public active suggested coupons for the checkout drawer."""
        result = await db.execute(
            select(Coupon)
            .where(
                Coupon.store_id == store_id,
                Coupon.is_active.is_(True),
                Coupon.show_in_suggestions.is_(True),
            )
            .order_by(Coupon.discount_value.desc())
            .limit(5)
        )
        return list(result.scalars().all())

    async def update_coupon(
        self,
        db: AsyncSession,
        coupon_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: CouponUpdateRequest,
    ) -> Coupon:
        """Update coupon properties."""
        result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
        coupon = result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found.")
        await store_service.get_store_by_id(db, coupon.store_id, owner_id=owner_id)

        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(coupon, key, value)

        await db.commit()
        await db.refresh(coupon)
        return coupon

    async def delete_coupon(
        self,
        db: AsyncSession,
        coupon_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> bool:
        """Delete a coupon."""
        result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
        coupon = result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found.")
        await store_service.get_store_by_id(db, coupon.store_id, owner_id=owner_id)

        await db.delete(coupon)
        await db.commit()
        return True

    async def validate_coupon(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        code: str,
        cart_total: Decimal,
    ) -> tuple[bool, Decimal, Decimal, str]:
        """Validate coupon code and return (is_valid, discount_amount, final_total, message)."""
        clean_code = code.upper().strip()
        result = await db.execute(
            select(Coupon).where(
                Coupon.store_id == store_id,
                Coupon.code == clean_code,
                Coupon.is_active.is_(True),
            )
        )
        coupon = result.scalar_one_or_none()
        if not coupon:
            return False, Decimal("0.00"), cart_total, "Invalid or expired coupon code."

        if coupon.min_order_value and cart_total < coupon.min_order_value:
            return (
                False,
                Decimal("0.00"),
                cart_total,
                f"Minimum order value of {coupon.min_order_value} required for this coupon.",
            )

        if coupon.discount_type == "percentage":
            discount = (cart_total * coupon.discount_value) / Decimal("100.00")
        else:
            discount = coupon.discount_value

        discount = min(discount, cart_total)
        final_total = max(Decimal("0.00"), cart_total - discount)

        return (
            True,
            round(discount, 2),
            round(final_total, 2),
            f"Coupon '{coupon.code}' applied successfully!",
        )


coupon_service = CouponService()
