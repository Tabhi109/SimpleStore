# SimpleStore — Engineering Principles & Project Rules

These 12 core rules govern the development, design, and maintenance of SimpleStore. Every contributor and AI agent working on this codebase must adhere strictly to these principles.

---

### Rule 1: SimpleStore is NOT Shopify
SimpleStore is an intentionally simple, zero-friction store launcher for small businesses and creators. Do not introduce complex visual page builders, app stores, intricate shipping engines, multi-tiered subscription matrixes, or multi-currency forex systems.

### Rule 2: Prefer Simple Solutions
Always choose the simplest solution that fulfills the requirement cleanly. Resist premature optimization, speculative abstractions, and unnecessary dependencies.

### Rule 3: No Microservices
SimpleStore is a **Modular Monolith**. Keep the backend in FastAPI with clear domain boundaries (`auth`, `stores`, `products`, `orders`, `ai`, `storage`) and the frontend in Next.js. Do not introduce Kafka, RabbitMQ, Celery, gRPC, or distributed event buses unless explicitly approved.

### Rule 4: No Unnecessary Abstractions
Do not build repositories, factories, or service layers purely for the sake of dogma. Write clean, direct, readable Python and TypeScript with clear separation of concerns.

### Rule 5: PostgreSQL is the Source of Truth
PostgreSQL owns all state, relational integrity, foreign keys, unique constraints, and transaction lifecycles. Redis is used strictly for transient caching, rate limiting, and ephemeral key-value acceleration.

### Rule 6: AI is an Optional Enhancement
Sarvam AI is integrated strictly as an optional assistant (generating store copy, product drafts, and theme suggestions). The application must remain 100% functional and testable even if the AI service is unreachable or unconfigured. AI must **never** control business rules, mutate prices, create orders, or execute arbitrary code.

### Rule 7: Backend Validates All Financial & Order Data
The backend owns all calculations. It must independently verify product existence, active status, current pricing, and inventory levels within a transaction before creating an order.

### Rule 8: Never Trust Client-Provided Prices or Totals
Never accept or trust product prices, order subtotals, discounts, or inventory counts sent from the frontend client. The client provides only product IDs and requested quantities.

### Rule 9: Never Expose Secrets
API keys (including Sarvam AI credentials), database connection strings, JWT secret keys, and AWS/S3 access credentials must remain strictly in backend environment variables. Never prefix backend secrets with `NEXT_PUBLIC_` or commit them to source control.

### Rule 10: Every Feature Must Have a Clear User Benefit
If a feature does not directly shorten the time to create a store, simplify buying a product, or provide clear merchant visibility, it does not belong in SimpleStore.

### Rule 11: Keep the Merchant Journey Extremely Simple
The target merchant onboarding journey must take approximately **5–10 minutes** from signup to live store preview and publish. Minimize cognitive load: use guided questionnaires and pre-defined UI/UX templates rather than endless configuration forms.

### Rule 12: Do Not Add Out-of-Scope Features Without Approval
Never silently expand scope or introduce unapproved enterprise patterns. If a proposed change conflicts with existing architecture or rules, stop and document the trade-offs first.
