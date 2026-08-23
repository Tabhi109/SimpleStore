"""Store domain service managing multi-tenant store lifecycle, onboarding, and public views."""

import re
import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.service import OnboardingQuestionnaireInput, ai_service
from app.auth.models import User
from app.products.models import Product
from app.stores.models import Store
from app.stores.schemas import StoreCreateRequest, StoreUpdateRequest


def slugify(text: str) -> str:
    """Convert string to URL-friendly lowercase slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or f"store-{uuid.uuid4().hex[:6]}"


class StoreService:
    """Service handling store CRUD, theme configuration, and AI generation."""

    async def create_store(
        self,
        db: AsyncSession,
        owner_id: uuid.UUID,
        request: StoreCreateRequest,
    ) -> Store:
        """Create a new store for merchant with slug collision prevention."""
        base_slug = slugify(request.slug or request.name)
        slug = base_slug

        # Check for slug collision and append random suffix if needed
        existing = await db.execute(select(Store).where(Store.slug == slug))
        if existing.scalar_one_or_none():
            slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

        theme_dict = request.theme_config.model_dump() if request.theme_config else {}

        new_store = Store(
            owner_id=owner_id,
            name=request.name,
            slug=slug,
            category=request.category,
            tagline=request.tagline,
            description=request.description,
            logo_url=request.logo_url,
            banner_url=request.banner_url,
            currency=request.currency.upper(),
            language=request.language.lower(),
            theme_config=theme_dict,
            onboarding_context=request.onboarding_context,
            is_active=request.is_active,
            published=request.published,
        )
        db.add(new_store)
        await db.commit()
        await db.refresh(new_store)
        return new_store

    async def get_user_stores(self, db: AsyncSession, owner_id: uuid.UUID) -> list[Store]:
        """Fetch all stores belonging to the authenticated merchant."""
        result = await db.execute(
            select(Store).where(Store.owner_id == owner_id).order_by(Store.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_store_by_id(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID | None = None,
    ) -> Store:
        """Get store by ID, optionally verifying ownership or auto-transferring from demo owner."""
        result = await db.execute(select(Store).where(Store.id == store_id))
        store = result.scalar_one_or_none()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found.",
            )
        if owner_id and store.owner_id != owner_id:
            # Check if store belongs to an anonymous creator session
            prev_user_res = await db.execute(select(User).where(User.id == store.owner_id))
            prev_user = prev_user_res.scalar_one_or_none()
            if prev_user and (prev_user.email.endswith("@simplestore.demo") or prev_user.email.startswith("creator-")):
                store.owner_id = owner_id
                await db.commit()
                await db.refresh(store)
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to modify this store.",
                )
        return store

    async def claim_store(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        new_owner_id: uuid.UUID,
    ) -> Store:
        """Claim ownership of an onboarding store."""
        result = await db.execute(select(Store).where(Store.id == store_id))
        store = result.scalar_one_or_none()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found.",
            )
        store.owner_id = new_owner_id
        await db.commit()
        await db.refresh(store)
        return store

    async def get_public_store_by_slug(self, db: AsyncSession, slug: str) -> Store:
        """Fetch public store with published products."""
        result = await db.execute(
            select(Store).where(Store.slug == slug).options(selectinload(Store.products))
        )
        store = result.scalar_one_or_none()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found.",
            )
        return store

    async def update_store(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
        request: StoreUpdateRequest,
    ) -> Store:
        """Update store details, currency, language, or theme matrix."""
        store = await self.get_store_by_id(db, store_id, owner_id=owner_id)

        update_data = request.model_dump(exclude_unset=True)
        if "theme_config" in update_data and update_data["theme_config"] is not None:
            # Merge theme tokens
            current_theme = dict(store.theme_config or {})
            current_theme.update(update_data["theme_config"])
            store.theme_config = current_theme
            del update_data["theme_config"]

        for key, value in update_data.items():
            if value is not None:
                setattr(store, key, value)

        await db.commit()
        await db.refresh(store)
        return store

    async def toggle_publish(
        self,
        db: AsyncSession,
        store_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Store:
        """Toggle store public status."""
        store = await self.get_store_by_id(db, store_id, owner_id=owner_id)
        store.published = not store.published
        store.is_active = store.published
        await db.commit()
        await db.refresh(store)
        return store

    async def generate_onboarding_store(
        self,
        db: AsyncSession,
        owner_id: uuid.UUID,
        questionnaire: OnboardingQuestionnaireInput,
        currency: str = "USD",
        language: str = "en",
    ) -> Store:
        """AI-orchestrated store setup: generates brand copy, starter products, and theme config."""
        # 1. Call AI Service
        ai_res = await ai_service.generate_store_from_questionnaire(questionnaire)

        # 2. Build Theme Config
        theme_config = {
            "archetype": ai_res.recommended_theme,
            "font_pairing": "serif" if ai_res.recommended_theme == "editorial" else "sans",
            "color_preset": "rose" if ai_res.recommended_theme == "editorial" else "slate",
            "enable_dark_mode_toggle": True,
            "hero_style": "centered",
        }

        base_slug = slugify(questionnaire.store_name)
        existing = await db.execute(select(Store).where(Store.slug == base_slug))
        slug = base_slug if not existing.scalar_one_or_none() else f"{base_slug}-{uuid.uuid4().hex[:4]}"

        new_store = Store(
            owner_id=owner_id,
            name=questionnaire.store_name,
            slug=slug,
            category=questionnaire.category,
            tagline=ai_res.tagline,
            description=ai_res.description,
            currency=currency.upper(),
            language=language.lower(),
            theme_config=theme_config,
            onboarding_context=questionnaire.model_dump(),
            is_active=True,
            published=True,  # Ready to preview
        )
        db.add(new_store)
        await db.flush()

        # 3. Create Starter Products
        for idx, p in enumerate(ai_res.starter_products):
            p_slug = slugify(p.name)
            p_price = Decimal(str(p.suggested_price))
            p_mrp = round(p_price * Decimal("1.25"), 2)
            p_img = getattr(p, "image_url", None)
            starter_product = Product(
                store_id=new_store.id,
                product_code=f"PROD-{(idx + 1):03d}",
                name=p.name,
                slug=p_slug or f"product-{uuid.uuid4().hex[:4]}",
                description=p.description,
                mrp=p_mrp,
                price=p_price,
                currency=currency.upper(),
                inventory=p.inventory,
                inventory_display_limit=p.inventory,
                order_limit=5,
                image_url=p_img,
                images=[p_img] if p_img else [],
                is_ai_generated=True,
                is_active=True,
                published=True,
            )
            db.add(starter_product)

        await db.commit()
        await db.refresh(new_store)
        return new_store


store_service = StoreService()
