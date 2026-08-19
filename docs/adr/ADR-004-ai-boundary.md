# ADR-004: Strict AI Boundary & Cost Control

## Status
Accepted

## Context
Integrating generative AI (Sarvam AI) introduces risks around API key exposure, unexpected token billing, non-deterministic outputs, and external downtime affecting core store operations.

## Decision
We enforce a **Strict Backend AI Boundary**:
1. All AI requests must originate from authenticated backend endpoints; the frontend never contacts Sarvam AI directly.
2. AI calls occur solely upon explicit merchant triggers (questionnaire submit or clicking *"Write it for me"*).
3. The core application must remain 100% operational with manual fallbacks if AI fails or times out.
4. AI never makes financial, order, or inventory decisions.

## Consequences
### Positive
- Zero risk of leaking proprietary API keys to the browser.
- Predictable token costs with optional Redis caching for repeated prompts.
- High resilience: merchant onboarding and product creation work seamlessly even during third-party AI outages.

### Negative
- Requires maintaining backend prompt templates and fallback schemas.
