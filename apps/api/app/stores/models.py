"""Store SQLAlchemy ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.auth.models import User
    from app.orders.models import Order
    from app.products.models import Product

# Default minimal theme token configuration
DEFAULT_THEME_CONFIG: dict[str, Any] = {
    "archetype": "minimal",
    "palette": {
        "primary": "#0f172a",
        "accent": "#2563eb",
        "background": "#ffffff",
        "surface": "#f8fafc",
        "text": "#0f172a",
        "muted": "#64748b",
    },
    "typography": {
        "heading_font": "sans",
        "body_font": "sans",
    },
    "layout": {
        "hero_style": "centered",
        "product_grid_columns": 3,
        "card_style": "bordered",
    },
}


class Store(Base, TimestampMixin):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
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
        String(512),
        nullable=True,
    )
    theme_config: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        default=DEFAULT_THEME_CONFIG,
        nullable=False,
    )
    onboarding_context: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
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
