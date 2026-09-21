"""AI endpoints for store generation and copy assistance."""

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends

from app.ai.service import (
    OnboardingGenerationResult,
    OnboardingQuestionnaireInput,
    ProductDescriptionInput,
    ai_service,
)
from app.auth.models import User
from app.core.dependencies import enforce_ai_rate_limit, get_redis

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/onboarding-generate",
    response_model=OnboardingGenerationResult,
    summary="Generate store branding & starter products from questionnaire",
)
async def generate_store_from_questionnaire(
    payload: OnboardingQuestionnaireInput,
    redis_client: aioredis.Redis = Depends(get_redis),
    current_user: User | None = Depends(enforce_ai_rate_limit),
):
    """Generates tagline, store description, theme recommendation, and starter product drafts."""
    _ = current_user
    return await ai_service.generate_store_from_questionnaire(payload, redis=redis_client)


@router.post(
    "/product-description",
    summary="Generate or polish product description",
)
async def generate_product_description(
    payload: ProductDescriptionInput,
    redis_client: aioredis.Redis = Depends(get_redis),
    current_user: User | None = Depends(enforce_ai_rate_limit),
):
    """Generates engaging product copy for the 'Write it for me' button."""
    _ = current_user
    content = await ai_service.generate_product_description(payload, redis=redis_client)
    return {"description": content}
