"""Store domain service handling store lifecycle, theme matrix, and public resolution."""

import re
import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.service import OnboardingQuestionnaireInput, ai_service
from app.products.models import Product
from app.stores.models import DEFAULT_THEME_CONFIG, Store
from app.stores.schemas import StoreCreateRequest, StoreUpdateRequest


def slugify(text: str) -> str:
    """Convert text into clean URL slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


class StoreService:
    """Service handling store operations and ownership authorization."""

    async def create_store(
        self,
        db: AsyncSession,
        owner_id: uuid.UUID,
        request: StoreCreateRequest,
    ) -> Store:
        """Create a new store with unique slug."""
        clean_slug = slugify(request.slug or request.name)
        if not clean_slug:
            clean_slug = f"store-{uuid.uuid4().hex[:6]}"

        # Check slug availability
        result = await db.execute(select(Store).where(Store.slug == clean_slug))
        if result.scalar_one_or_none():
            clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        theme_dict = (
            request.theme_config.model_dump()
            if request.theme_config
            else dict(DEFAULT_THEME_CONFIG)
        )

        new_store = Store(
            owner_id=owner_id,
            name=request.name,
            slug=clean_slug,
            category=request.category,
            tagline=request.tagline,
            description=request.description,
            logo_url=request.logo_url,
            currency=request.currency.upper(),
            language=request.language.lower(),
            theme_config=theme_dict,
            onboarding_context=request.onboarding_context,
            published=False,
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
        """Get store by ID, optionally verifying ownership."""
        result = await db.execute(select(Store).where(Store.id == store_id))
        store = result.scalar_one_or_none()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found.",
            )
        if owner_id and store.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this store.",
            )
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
        """Toggle store publication status."""
        store = await self.get_store_by_id(db, store_id, owner_id=owner_id)
        store.published = not store.published
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
        """AI-guided creation of a full store with copy and starter products."""
        # 1. Invoke AI Service
        ai_res = await ai_service.generate_store_from_questionnaire(questionnaire)

        # 2. Create Store
        clean_slug = slugify(questionnaire.store_name)
        result = await db.execute(select(Store).where(Store.slug == clean_slug))
        if result.scalar_one_or_none():
            clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        # Map vibe to theme matrix
        vibe_theme_map = {
            "minimal": ("minimal", "sans", "slate"),
            "editorial": ("editorial", "serif", "rose"),
            "warm": ("warm", "rounded", "amber"),
            "bold": ("bold", "mono", "indigo"),
            "playful": ("warm", "rounded", "emerald"),
            "luxurious": ("editorial", "serif", "slate"),
        }
        arch, font, color = vibe_theme_map.get(
            questionnaire.vibe.lower(), ("minimal", "sans", "slate")
        )

        theme_config = {
            "archetype": arch,
            "font_pairing": font,
            "color_preset": color,
            "enable_dark_mode_toggle": True,
            "hero_style": "centered",
        }

        new_store = Store(
            owner_id=owner_id,
            name=questionnaire.store_name,
            slug=clean_slug,
            category=questionnaire.category,
            tagline=ai_res.tagline,
            description=ai_res.description,
            currency=currency.upper(),
            language=language.lower(),
            theme_config=theme_config,
            onboarding_context=questionnaire.model_dump(),
            published=True,  # Ready to preview
        )
        db.add(new_store)
        await db.flush()

        # 3. Create Starter Products
        for p in ai_res.starter_products:
            p_slug = slugify(p.name)
            starter_product = Product(
                store_id=new_store.id,
                name=p.name,
                slug=p_slug or f"product-{uuid.uuid4().hex[:4]}",
                description=p.description,
                price=Decimal(str(p.suggested_price)),
                currency=currency.upper(),
                inventory=p.inventory,
                is_ai_generated=True,
                published=True,
            )
            db.add(starter_product)

        await db.commit()
        await db.refresh(new_store)
        return new_store


store_service = StoreService()
