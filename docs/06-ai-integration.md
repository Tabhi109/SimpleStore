# 06 - AI Integration & Provider Boundaries

## 1. Core Principles
1. **AI is strictly an optional enhancement**: SimpleStore is 100% functional without AI.
2. **Never expose AI keys**: All AI requests route through the FastAPI backend (`app/ai/`).
3. **No automatic execution**: AI generates text suggestions and starter drafts; it never creates live orders, modifies financial data, or executes arbitrary code.
4. **Defensive Cost & Token Control**: AI is invoked only upon explicit user action (e.g. clicking *"Write it for me"* or submitting the onboarding wizard). Responses are cached in Redis where applicable.

---

## 2. Sarvam AI Provider Integration

The AI provider boundary is encapsulated in `apps/api/app/ai/provider.py`.

```
Frontend (Next.js)
       │
       │ POST /api/v1/ai/product-description
       ▼
FastAPI (app/ai/router.py)
       │
       ├─► Verify user authentication & rate limits
       ├─► Check Redis for cached response hash
       ▼
AI Service (app/ai/service.py)
       │
       ├─► Formats structured prompt with strict JSON output schema
       ▼
Sarvam AI Client (app/ai/provider.py)
       │ (HTTPS POST to api.sarvam.ai)
       ▼
Structured Response (Sanitized, validated via Pydantic)
       │
       ▼
Returned to Frontend for Merchant Review & Editing
```

---

## 3. Supported AI Capabilities

### 3.1 Questionnaire-Driven Store Generator
- **Input**: Store Name, Category, Tone/Vibe, Sample Product description.
- **Output**: Tagline, Store Description, 2–3 suggested starter products with names, descriptions, and recommended sample prices.

### 3.2 Product Description Generator ("Write it for me")
- **Input**: Product name, Category, Key features / keywords.
- **Output**: Clean, compelling product copy formatted in concise markdown/bullet points.

### 3.3 Fallback Handling
If Sarvam AI returns an error, times out (> 5000ms), or if the API key is not configured, the service returns a graceful fallback message allowing the merchant to input their content manually without blocking the UI flow.
