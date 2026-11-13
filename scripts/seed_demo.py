"""Create the public sample store used on the homepage.

Idempotent: re-running updates the same slug instead of duplicating it.
Requires NEON_DB_URL or DATABASE_URL, and DEMO_PASSWORD.
"""

import asyncio
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from sqlalchemy import select

from app.auth.models import User
from app.core.security import hash_password
from app.coupons.models import Coupon  # noqa: F401
from app.database.base import Base
from app.database.session import AsyncSessionLocal, engine
from app.orders.models import Order, OrderItem  # noqa: F401
from app.products.models import Product
from app.stores.models import Store

DEMO_EMAIL = os.environ.get("DEMO_EMAIL", "demo@simplestore.dev")
DEMO_SLUG = "lumen-atelier"

PRODUCTS = [
    {
        "name": "Hand-thrown stoneware mug",
        "slug": "stoneware-mug",
        "product_code": "LUM-MUG",
        "description": "Speckled clay, glazed in warm sand. Holds 300ml and stacks cleanly on a shelf.",
        "mrp": Decimal("1800"),
        "price": Decimal("1450"),
        "inventory": 24,
        "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Linen table runner",
        "slug": "linen-table-runner",
        "product_code": "LUM-LIN",
        "description": "Stonewashed linen, 40 by 180 centimetres. Softens with every wash.",
        "mrp": Decimal("3200"),
        "price": Decimal("2600"),
        "inventory": 12,
        "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Brass taper holders, pair",
        "slug": "brass-taper-holders",
        "product_code": "LUM-BRS",
        "description": "Solid brass, unlacquered, so the surface darkens where you touch it.",
        "mrp": Decimal("2400"),
        "price": Decimal("2100"),
        "inventory": 18,
        "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "name": "Olive oil pourer",
        "slug": "olive-oil-pourer",
        "product_code": "LUM-OIL",
        "description": "A small ceramic bottle with a cork stopper. Meant for the table, not the cupboard.",
        "mrp": Decimal("1600"),
        "price": Decimal("1250"),
        "inventory": 30,
        "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
    },
]

THEME = {
    "archetype": "editorial",
    "font_pairing": "serif",
    "color_preset": "amber",
    "enable_dark_mode_toggle": True,
    "hero_style": "split",
    "announcement_text": "Ships across India · Cash on delivery",
    "about_story": "Lumen Atelier is the sample storefront on SimpleStore. It is a small home-goods shop used to show themes, galleries, cart, and checkout.",
    "contact_email": "hello@simplestore.dev",
    "shipping_note": "Dispatch in 2 days. Cash on delivery at checkout.",
    "brand_pillars": [
        {"title": "Small batches", "desc": "Pieces are made in short runs, not warehouses."},
        {"title": "Honest materials", "desc": "Clay, linen, and brass. Nothing plated."},
        {"title": "Easy checkout", "desc": "Cash on delivery, with the price checked on the server."},
    ],
}


async def main() -> None:
    password = os.environ.get("DEMO_PASSWORD")
    if not password or len(password) < 8:
        raise SystemExit("Set DEMO_PASSWORD to at least 8 characters.")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).where(User.email == DEMO_EMAIL))).scalar_one_or_none()
        if user is None:
            user = User(email=DEMO_EMAIL, password_hash=hash_password(password))
            session.add(user)
            await session.flush()
        else:
            user.password_hash = hash_password(password)

        store = (await session.execute(select(Store).where(Store.slug == DEMO_SLUG))).scalar_one_or_none()
        if store is None:
            store = Store(owner_id=user.id, name="Lumen Atelier", slug=DEMO_SLUG)
            session.add(store)
            await session.flush()

        store.owner_id = user.id
        store.name = "Lumen Atelier"
        store.category = "Home"
        store.tagline = "Quiet objects for a lived-in table."
        store.description = (
            "A sample SimpleStore shop: ceramics, linen, and brass, with a working cart and cash-on-delivery checkout."
        )
        store.currency = "INR"
        store.language = "en"
        store.published = True
        store.is_active = True
        store.theme_config = THEME
        store.logo_url = PRODUCTS[0]["image_url"]
        store.banner_url = "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=80"

        existing = {
            product.slug: product
            for product in (await session.execute(select(Product).where(Product.store_id == store.id))).scalars()
        }
        for item in PRODUCTS:
            product = existing.get(item["slug"])
            if product is None:
                product = Product(store_id=store.id, slug=item["slug"], name=item["name"], price=item["price"])
                session.add(product)
            product.name = item["name"]
            product.product_code = item["product_code"]
            product.description = item["description"]
            product.mrp = item["mrp"]
            product.price = item["price"]
            product.currency = "INR"
            product.inventory = item["inventory"]
            product.image_url = item["image_url"]
            product.images = [item["image_url"]]
            product.published = True
            product.is_active = True

        await session.commit()
        print(f"Seeded store /store/{DEMO_SLUG} for {DEMO_EMAIL}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
