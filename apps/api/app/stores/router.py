"""Store REST API Router."""

import uuid

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.service import OnboardingQuestionnaireInput
from app.auth.models import User
from app.core.config import settings
from app.core.dependencies import enforce_rate_limit, get_current_user, get_db, get_redis
from app.stores.schemas import StoreCreateRequest, StoreResponse, StoreUpdateRequest
from app.stores.service import store_service

router = APIRouter(prefix="/stores", tags=["Stores"])


class OnboardingGenerateRequest(BaseModel):
    store_name: str
    category: str
    vibe: str
    product_summary: str
    target_audience: str | None = None
    currency: str = "USD"
    language: str = "en"


@router.post(
    "",
    response_model=StoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new store",
)
async def create_store(
    request: StoreCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new merchant store."""
    return await store_service.create_store(db, current_user.id, request)


@router.get(
    "/me",
    response_model=list[StoreResponse],
    summary="Get current user stores",
)
async def get_my_stores(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all stores owned by authenticated merchant."""
    return await store_service.get_user_stores(db, current_user.id)


@router.post(
    "/onboarding-generate",
    response_model=StoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="AI-assisted store launch from questionnaire",
)
async def generate_onboarding_store(
    request: OnboardingGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(get_redis),
):
    """Generate complete store copy and starter products from questionnaire."""
    await enforce_rate_limit(
        redis_client,
        "ai",
        str(current_user.id),
        settings.AI_RATE_LIMIT_AUTH_PER_HOUR,
    )
    questionnaire = OnboardingQuestionnaireInput(
        store_name=request.store_name,
        category=request.category,
        vibe=request.vibe,
        product_summary=request.product_summary,
        target_audience=request.target_audience,
    )
    return await store_service.generate_onboarding_store(
        db=db,
        owner_id=current_user.id,
        questionnaire=questionnaire,
        currency=request.currency,
        language=request.language,
        redis=redis_client,
    )


@router.get(
    "/{slug}",
    summary="Get public store data by slug",
)
async def get_public_store(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Fetch public store info and active products for storefront."""
    store = await store_service.get_public_store_by_slug(db, slug)
    return {
        "id": store.id,
        "name": store.name,
        "slug": store.slug,
        "category": store.category,
        "tagline": store.tagline,
        "description": store.description,
        "logo_url": store.logo_url,
        "currency": store.currency,
        "language": store.language,
        "theme_config": store.theme_config,
        "published": store.published,
        "products": [
            {
                "id": p.id,
                "store_id": p.store_id,
                "name": p.name,
                "slug": p.slug,
                "description": p.description,
                "price": float(p.price),
                "mrp": float(p.mrp) if p.mrp is not None else None,
                "currency": p.currency,
                "inventory": p.inventory,
                "order_limit": p.order_limit,
                "image_url": p.image_url,
                "images": p.images or [],
                "is_ai_generated": p.is_ai_generated,
                "is_active": p.is_active,
                "published": p.published,
            }
            for p in store.products
            if p.published and p.is_active
        ],
    }


@router.patch(
    "/{store_id}",
    response_model=StoreResponse,
    summary="Update store details or theme tokens",
)
async def update_store(
    store_id: uuid.UUID,
    request: StoreUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update store properties, theme matrix, currency, or language."""
    return await store_service.update_store(db, store_id, current_user.id, request)


@router.post(
    "/{store_id}/publish",
    response_model=StoreResponse,
    summary="Toggle store publish status",
)
async def toggle_publish(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle whether store is published publicly."""
    return await store_service.toggle_publish(db, store_id, current_user.id)


@router.post(
    "/{store_id}/claim",
    response_model=StoreResponse,
    summary="Claim ownership of an onboarding store",
)
async def claim_store(
    store_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Claim ownership of an onboarding store to current user."""
    return await store_service.claim_store(db, store_id, current_user.id)
