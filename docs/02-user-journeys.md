# 02 - User Journeys & Flows

## Merchant Journey (5–10 Minutes from Start to Publish)

```mermaid
journey
    title Merchant Onboarding & Launch Journey
    section Step 1: Sign Up
      Create account with email/password: 5: Merchant
    section Step 2: Answer Questionnaire
      Enter store name & category: 5: Merchant
      Pick brand vibe & tone: 5: Merchant
      Provide brief product idea: 5: Merchant
    section Step 3: AI Generation & Review
      AI drafts tagline, description, starter products: 5: SimpleStore
      Merchant reviews and edits draft products: 4: Merchant
    section Step 4: Visual Selection
      Choose pre-defined theme (Minimal, Editorial, Warm, Bold): 5: Merchant
      Live interactive preview: 5: Merchant
    section Step 5: Publish & Manage
      Click Publish Store: 5: Merchant
      Share live store URL: 5: Merchant
      Access minimal merchant dashboard: 5: Merchant
```

---

## Customer Journey (Zero-Friction Purchase)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Next.js Storefront (/store/{slug})
    participant API as FastAPI Backend
    participant DB as PostgreSQL 16

    Customer->>Frontend: Visits /store/artisan-candles
    Frontend->>API: GET /api/v1/stores/artisan-candles
    API-->>Frontend: Store metadata, theme tokens, product list
    Customer->>Frontend: Views product & clicks "Add to Cart"
    Customer->>Frontend: Proceeds to Checkout (Enters details)
    Customer->>Frontend: Clicks "Place Order" (Mock Payment)
    Frontend->>API: POST /api/v1/stores/{id}/orders (Item IDs & Quantities)
    
    rect rgb(240, 248, 255)
        Note over API,DB: Server-Side Transaction
        API->>DB: Fetch current product prices & lock inventory rows
        API->>DB: Verify sufficient stock & calculate order total
        API->>DB: Insert Order & OrderItem records
        API->>DB: Decrement product inventory
        API->>DB: Commit Transaction
    end

    API-->>Frontend: 201 Created (Order Confirmation Details)
    Frontend->>Customer: Displays Order Confirmation & Receipt
```
