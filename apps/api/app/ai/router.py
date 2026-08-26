"""AI endpoints for store generation and copy assistance."""

from fastapi import APIRouter, Depends

from app.ai.service import (
    OnboardingGenerationResult,
    OnboardingQuestionnaireInput,
    ProductDescriptionInput,
    ai_service,
)
from app.auth.models import User
from app.core.dependencies import get_current_user_optional

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/onboarding-generate",
    response_model=OnboardingGenerationResult,
    summary="Generate store branding & starter products from questionnaire",
)
async def generate_store_from_questionnaire(
    payload: OnboardingQuestionnaireInput,
    current_user: User | None = Depends(get_current_user_optional),
):
    """Generates tagline, store description, theme recommendation, and starter product drafts."""
    return await ai_service.generate_store_from_questionnaire(payload)


@router.post(
    "/product-description",
    summary="Generate or polish product description",
)
async def generate_product_description(
    payload: ProductDescriptionInput,
    current_user: User | None = Depends(get_current_user_optional),
):
    """Generates engaging product copy for the 'Write it for me' button."""
    content = await ai_service.generate_product_description(payload)
    return {"description": content}
