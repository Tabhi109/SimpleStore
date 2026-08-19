# 03 - Architecture & System Design

## 1. Architectural Style: Modular Monolith
SimpleStore follows a **Modular Monolith** architecture pattern. It maintains clear logical domain boundaries within a single deployable backend API and a unified frontend application.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  Next.js 14 (App Router, Server & Client Components, Tailwind, Zustand) |
+-------------------------------------------------------------------------+
                                     │
                             REST / JSON (HTTPS)
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                               API TIER                                  |
|                         FastAPI Application                             |
|                                                                         |
|  +-------------+  +-------------+  +-------------+  +----------------+  |
|  |    Auth     |  |   Stores    |  |  Products   |  |     Orders     |  |
|  |   Module    |  |   Module    |  |   Module    |  |     Module     |  |
|  +-------------+  +-------------+  +-------------+  +----------------+  |
|         │                │                │                 │           |
|  +-------------+  +-------------+  +-------------+  +----------------+  |
|  | AI Boundary |  |   Storage   |  | Middleware  |  | Core & Config  |  |
|  | (Sarvam AI) |  | (Presigned) |  | (CORS/Rate) |  |   (Security)   |  |
|  +-------------+  +-------------+  +-------------+  +----------------+  |
+-------------------------------------------------------------------------+
              │                                    │
              ▼                                    ▼
+---------------------------+            +-------------------+
|      DATA PERSISTENCE     |            |       CACHE       |
|       PostgreSQL 16       |            |      Redis 7      |
|  (ACID Relational Engine) |            | (Storefront Cache)|
+---------------------------+            +-------------------+
```

---

## 2. Domain Boundaries

### `auth`
- Handles user registration, JWT token generation, refresh tokens, password hashing (bcrypt), and current user dependency injection.

### `stores`
- Manages store entities, unique slugs, store ownership rules, `theme_config` JSONB, and `onboarding_context` persistence.

### `products`
- Manages store inventory, SKU/slug creation within a store, pricing, images, and AI-generated product draft flags.

### `orders`
- Handles transaction-safe order execution, inventory decrementing, historical snapshot preservation in `order_items`, and order status updates.

### `ai`
- Encapsulates prompt templates and communication with Sarvam AI. Provides defensive fallbacks if AI is unavailable or rate-limited.

### `storage`
- Provides S3-compatible presigned upload URL generation so client uploads directly to object storage without streaming files through the backend API.

---

## 3. Security Principles
- **No Client Trust**: Client never provides prices, order totals, or store ownership proofs.
- **Authorization Guard**: Every store/product modification endpoint strictly verifies `store.owner_id == current_user.id`.
- **Secret Isolation**: All API keys, database credentials, and token secrets remain strictly in backend environment variables.
