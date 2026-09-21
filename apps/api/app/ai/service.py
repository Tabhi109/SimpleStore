"""AI Generation Service for store copy, product drafts, and theme suggestions."""

import hashlib
import json
import logging

from pydantic import BaseModel, Field

from app.ai.provider import ai_provider
from app.core.config import settings

logger = logging.getLogger("simplestore.ai.service")

THEME_TO_TOKENS = {
    "minimal": {"archetype": "minimal", "font_pairing": "sans", "color_preset": "slate"},
    "editorial": {"archetype": "editorial", "font_pairing": "serif", "color_preset": "rose"},
    "warm": {"archetype": "warm", "font_pairing": "rounded", "color_preset": "amber"},
    "bold": {"archetype": "bold", "font_pairing": "sans", "color_preset": "indigo"},
    "playful": {"archetype": "warm", "font_pairing": "rounded", "color_preset": "amber"},
    "luxurious": {"archetype": "editorial", "font_pairing": "serif", "color_preset": "rose"},
}


class OnboardingQuestionnaireInput(BaseModel):
    store_name: str
    category: str
    vibe: str
    product_summary: str
    target_audience: str | None = None


class StarterProductSuggestion(BaseModel):
    name: str
    description: str
    suggested_price: float
    inventory: int = 10
    image_url: str | None = None
    images: list[str] = []


class ThemeRecommendation(BaseModel):
    archetype: str
    font_pairing: str
    color_preset: str


class OnboardingGenerationResult(BaseModel):
    tagline: str
    description: str
    recommended_theme: str
    theme_recommendation: ThemeRecommendation
    starter_products: list[StarterProductSuggestion] = Field(default_factory=list)


class ProductDescriptionInput(BaseModel):
    product_name: str
    category: str | None = None
    keywords: str | None = None
    tone: str | None = "engaging"
    store_name: str | None = None
    target_audience: str | None = None


def _stable_cache_key(kind: str, payload: dict) -> str:
    blob = json.dumps(
        {"kind": kind, "model": settings.SARVAM_MODEL, "payload": payload},
        sort_keys=True,
        default=str,
    )
    digest = hashlib.sha256(blob.encode("utf-8")).hexdigest()
    return f"ai:{kind}:{digest}"


class AIService:
    """Service orchestrating AI prompts, Redis caching, and fallback responses."""

    def __init__(self):
        self.provider = ai_provider

    async def _cache_get(self, redis, key: str) -> str | None:
        if redis is None:
            return None
        try:
            return await redis.get(key)
        except Exception as exc:
            logger.warning(f"AI cache read failed: {exc}")
            return None

    async def _cache_set(self, redis, key: str, value: str) -> None:
        if redis is None:
            return
        try:
            await redis.set(key, value, ex=settings.AI_CACHE_TTL_SECONDS)
        except Exception as exc:
            logger.warning(f"AI cache write failed: {exc}")

    async def generate_store_from_questionnaire(
        self,
        input_data: OnboardingQuestionnaireInput,
        redis=None,
    ) -> OnboardingGenerationResult:
        """Generate tagline, description, theme, and starter products. Cached in Redis."""
        cache_payload = {
            "store_name": input_data.store_name.strip().lower(),
            "category": input_data.category.strip().lower(),
            "vibe": input_data.vibe.strip().lower(),
            "product_summary": input_data.product_summary.strip().lower(),
            "target_audience": (input_data.target_audience or "").strip().lower(),
        }
        cache_key = _stable_cache_key("onboarding", cache_payload)
        cached = await self._cache_get(redis, cache_key)
        if cached:
            try:
                return OnboardingGenerationResult.model_validate_json(cached)
            except Exception:
                logger.warning("Ignoring invalid AI cache payload.")

        system_prompt = (
            "You are an expert brand strategist and e-commerce copywriter. "
            "You generate clean, captivating, concise store branding and starter products. "
            "You MUST respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            '  "tagline": "string (punchy, 4-8 words)",\n'
            '  "description": "string (compelling 2-3 sentences)",\n'
            '  "recommended_theme": "minimal" | "warm" | "editorial" | "bold",\n'
            '  "starter_products": [\n'
            '    {"name": "string", "description": "string", "suggested_price": float, "inventory": int}\n'
            "  ]\n"
            "}"
        )

        user_prompt = (
            f"Store Name: {input_data.store_name}\n"
            f"Category: {input_data.category}\n"
            f"Brand Vibe: {input_data.vibe}\n"
            f"What they sell: {input_data.product_summary}\n"
            f"Target Audience: {input_data.target_audience or 'General customers'}\n\n"
            "Generate the brand copy and 2-3 starter products now in strict JSON."
        )

        raw_output = await self.provider.generate_chat_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.6,
        )

        if raw_output:
            try:
                clean_json = raw_output.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("```")[1]
                    if clean_json.startswith("json"):
                        clean_json = clean_json[4:]
                    clean_json = clean_json.strip()

                parsed = json.loads(clean_json)
                theme = str(parsed.get("recommended_theme", "minimal")).lower()
                tokens = THEME_TO_TOKENS.get(theme, THEME_TO_TOKENS["minimal"])
                result = OnboardingGenerationResult(
                    tagline=parsed.get(
                        "tagline", f"Handcrafted {input_data.category} made with care."
                    ),
                    description=parsed.get(
                        "description",
                        f"Welcome to {input_data.store_name}. Discover our curated selection of high-quality {input_data.category}.",
                    ),
                    recommended_theme=tokens["archetype"],
                    theme_recommendation=ThemeRecommendation(**tokens),
                    starter_products=[
                        StarterProductSuggestion(
                            name=p.get("name", "Signature Product"),
                            description=p.get("description", "Crafted with premium materials."),
                            suggested_price=float(p.get("suggested_price", 29.0)),
                            inventory=int(p.get("inventory", 15)),
                            image_url=p.get(
                                "image_url",
                                "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
                            ),
                            images=[
                                p.get(
                                    "image_url",
                                    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
                                )
                            ],
                        )
                        for p in parsed.get("starter_products", [])
                    ],
                )
                await self._cache_set(redis, cache_key, result.model_dump_json())
                return result
            except Exception as e:
                logger.warning(
                    f"Failed to parse AI response JSON: {e}. Using deterministic fallback."
                )

        return self._onboarding_fallback(input_data)

    def _onboarding_fallback(self, input_data: OnboardingQuestionnaireInput) -> OnboardingGenerationResult:
        tokens = THEME_TO_TOKENS.get(input_data.vibe.lower(), THEME_TO_TOKENS["minimal"])
        return OnboardingGenerationResult(
            tagline=f"Premium {input_data.category.lower()} crafted for you.",
            description=(
                f"Welcome to {input_data.store_name}. We create exceptional "
                f"{input_data.category.lower()} designed to elevate your everyday experience."
            ),
            recommended_theme=tokens["archetype"],
            theme_recommendation=ThemeRecommendation(**tokens),
            starter_products=[
                StarterProductSuggestion(
                    name=f"Signature {input_data.category}",
                    description=(
                        f"Our flagship handcrafted {input_data.category.lower()}, "
                        "made with exceptional attention to detail."
                    ),
                    suggested_price=35.00,
                    inventory=20,
                    image_url="https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
                    images=["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"],
                ),
                StarterProductSuggestion(
                    name=f"Essential {input_data.category} Set",
                    description=(
                        f"A curated starter pack featuring our most loved "
                        f"{input_data.category.lower()} essentials."
                    ),
                    suggested_price=55.00,
                    inventory=15,
                    image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
                    images=["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"],
                ),
            ],
        )

    async def generate_product_description(self, input_data: ProductDescriptionInput, redis=None) -> str:
        """Generate polished product description, cached in Redis."""
        cache_payload = {
            "product_name": input_data.product_name.strip().lower(),
            "category": (input_data.category or "").strip().lower(),
            "keywords": (input_data.keywords or "").strip().lower(),
            "tone": (input_data.tone or "engaging").strip().lower(),
        }
        cache_key = _stable_cache_key("product_desc", cache_payload)
        cached = await self._cache_get(redis, cache_key)
        if cached:
            return cached

        system_prompt = (
            "You are an expert e-commerce copywriter. Write a concise, engaging, and professional "
            "product description (2 short paragraphs plus 3 key bullet features). Keep it compelling and clean."
        )
        user_prompt = (
            f"Product: {input_data.product_name}\n"
            f"Category: {input_data.category or 'General'}\n"
            f"Keywords / Features: {input_data.keywords or 'High quality, durable, beautifully crafted'}\n"
            f"Tone: {input_data.tone}"
        )

        result = await self.provider.generate_chat_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.7,
        )

        if result and result.strip():
            text = result.strip()
            await self._cache_set(redis, cache_key, text)
            return text

        return (
            f"The **{input_data.product_name}** offers superior craftsmanship and timeless design. "
            f"Perfect for everyday use and built to last.\n\n"
            f"• Premium quality materials\n"
            f"• Designed for comfort and durability\n"
            f"• 100% satisfaction guaranteed"
        )


ai_service = AIService()
