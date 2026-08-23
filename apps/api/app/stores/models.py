"""Store SQLAlchemy ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.auth.models import User
    from app.coupons.models import Coupon
    from app.orders.models import Order
    from app.products.models import Product

# Default theme matrix token configuration
DEFAULT_THEME_CONFIG: dict[str, Any] = {
    "archetype": "minimal",
    "font_pairing": "sans",
    "color_preset": "slate",
    "enable_dark_mode_toggle": True,
    "hero_style": "centered",
}

JSONType = JSON().with_variant(JSONB, "postgresql")


class Store(Base, TimestampMixin):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    tagline: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    logo_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )
    banner_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )
    currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
        nullable=False,
    )
    language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        nullable=False,
    )
    theme_config: Mapped[dict[str, Any]] = mapped_column(
        JSONType,
        default=DEFAULT_THEME_CONFIG,
        nullable=False,
    )
    onboarding_context: Mapped[dict[str, Any] | None] = mapped_column(
        JSONType,
        nullable=True,
    )
    published: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    owner: Mapped[User] = relationship(
        "User",
        back_populates="stores",
    )
    products: Mapped[list[Product]] = relationship(
        "Product",
        back_populates="store",
        cascade="all, delete-orphan",
    )
    orders: Mapped[list[Order]] = relationship(
        "Order",
        back_populates="store",
        cascade="all, delete-orphan",
    )
    coupons: Mapped[list[Coupon]] = relationship(
        "Coupon",
        back_populates="store",
        cascade="all, delete-orphan",
    )
