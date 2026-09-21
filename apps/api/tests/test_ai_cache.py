"""Tests for Redis-backed AI response caching."""

import pytest

from app.ai.provider import ai_provider
from app.ai.service import OnboardingQuestionnaireInput, ai_service
from tests.conftest import MockRedis


@pytest.mark.asyncio
async def test_onboarding_generation_is_cached(monkeypatch):
    calls = {"count": 0}

    async def fake_complete(**kwargs):
        calls["count"] += 1
        return (
            '{"tagline":"Quiet Glow Studio","description":"Warm artisan candles.",'
            '"recommended_theme":"warm","starter_products":['
            '{"name":"Amber Jar","description":"Soy wax.","suggested_price":28,"inventory":12}'
            "]}"
        )

    monkeypatch.setattr(ai_provider, "generate_chat_completion", fake_complete)
    redis = MockRedis()
    payload = OnboardingQuestionnaireInput(
        store_name="Glow Co",
        category="Candles",
        vibe="warm",
        product_summary="soy candles",
    )
    first = await ai_service.generate_store_from_questionnaire(payload, redis=redis)
    second = await ai_service.generate_store_from_questionnaire(payload, redis=redis)
    assert first.tagline == "Quiet Glow Studio"
    assert second.tagline == first.tagline
    assert first.theme_recommendation.archetype == "warm"
    assert calls["count"] == 1
