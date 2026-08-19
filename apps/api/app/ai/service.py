"""AI Generation Service for store copy, product drafts, and theme suggestions."""

import json
import logging

from pydantic import BaseModel

from app.ai.provider import ai_provider

logger = logging.getLogger("simplestore.ai.service")


class OnboardingQuestionnaireInput(BaseModel):
    store_name: str
    category: str
    vibe: str  # minimal, warm, editorial, bold, playful, luxurious
    product_summary: str
    target_audience: str | None = None


class StarterProductSuggestion(BaseModel):
    name: str
    description: str
    suggested_price: float
    inventory: int = 10


class OnboardingGenerationResult(BaseModel):
    tagline: str
    description: str
    recommended_theme: str
    starter_products: list[StarterProductSuggestion]


class ProductDescriptionInput(BaseModel):
    product_name: str
    category: str | None = None
    keywords: str | None = None
    tone: str | None = "engaging"


class AIService:
    """Service orchestrating AI prompts, caching, and fallback responses."""

    def __init__(self):
        self.provider = ai_provider

    async def generate_store_from_questionnaire(
        self,
        input_data: OnboardingQuestionnaireInput,
    ) -> OnboardingGenerationResult:
        """Generate tagline, description, theme recommendation, and starter products from questionnaire."""
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
                # Strip code markdown backticks if present
                clean_json = raw_output.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("```")[1]
                    if clean_json.startswith("json"):
                        clean_json = clean_json[4:]
                    clean_json = clean_json.strip()

                parsed = json.loads(clean_json)
                return OnboardingGenerationResult(
                    tagline=parsed.get(
                        "tagline", f"Handcrafted {input_data.category} made with care."
                    ),
                    description=parsed.get(
                        "description",
                        f"Welcome to {input_data.store_name}. Discover our curated selection of high-quality {input_data.category}.",
                    ),
                    recommended_theme=parsed.get("recommended_theme", "minimal"),
                    starter_products=[
                        StarterProductSuggestion(
                            name=p.get("name", "Signature Product"),
                            description=p.get("description", "Crafted with premium materials."),
                            suggested_price=float(p.get("suggested_price", 29.0)),
                            inventory=int(p.get("inventory", 15)),
                        )
                        for p in parsed.get("starter_products", [])
                    ],
                )
            except Exception as e:
                logger.warning(
                    f"Failed to parse AI response JSON: {e}. Using deterministic fallback."
                )

        # Deterministic Fallback if AI unavailable or invalid
        vibe_theme_map = {
            "minimal": "minimal",
            "editorial": "editorial",
            "warm": "warm",
            "bold": "bold",
            "playful": "warm",
            "luxurious": "editorial",
        }
        theme = vibe_theme_map.get(input_data.vibe.lower(), "minimal")

        return OnboardingGenerationResult(
            tagline=f"Premium {input_data.category.lower()} crafted for you.",
            description=f"Welcome to {input_data.store_name}. We create exceptional {input_data.category.lower()} designed to elevate your everyday experience.",
            recommended_theme=theme,
            starter_products=[
                StarterProductSuggestion(
                    name=f"Signature {input_data.category}",
                    description=f"Our flagship handcrafted {input_data.category.lower()}, made with exceptional attention to detail.",
                    suggested_price=35.00,
                    inventory=20,
                ),
                StarterProductSuggestion(
                    name=f"Essential {input_data.category} Set",
                    description=f"A curated starter pack featuring our most loved {input_data.category.lower()} essentials.",
                    suggested_price=55.00,
                    inventory=15,
                ),
            ],
        )

    async def generate_product_description(self, input_data: ProductDescriptionInput) -> str:
        """Generate polished product description."""
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
            return result.strip()

        # Fallback
        return (
            f"The **{input_data.product_name}** offers superior craftsmanship and timeless design. "
            f"Perfect for everyday use and built to last.\n\n"
            f"• Premium quality materials\n"
            f"• Designed for comfort and durability\n"
            f"• 100% satisfaction guaranteed"
        )


ai_service = AIService()
