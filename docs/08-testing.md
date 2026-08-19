# 08 - Testing Strategy & Quality Assurance

## 1. Testing Pyramid

```
       / \
      /   \      E2E Tests (Playwright: Full Merchant & Customer Flows)
     /-----\
    /       \    Integration Tests (FastAPI TestClient + DB + Redis)
   /---------\
  /           \  Unit Tests (Pytest for Auth/Pricing, Vitest for React Components)
 /-------------\
```

---

## 2. Backend Testing (Pytest)

- **Fixtures (`tests/conftest.py`)**:
  - Sets up an async SQLAlchemy engine with isolated SQLite in-memory or PostgreSQL test database.
  - Generates JWT test headers for merchant and customer roles.
  - Injects mocked Redis and Sarvam AI clients.
- **Coverage Areas**:
  - `test_health.py`: Verifies `/api/v1/health` connectivity.
  - `test_security.py`: Password hashing, token generation, token expiration, invalid signatures.
  - `test_orders.py`: Concurrent checkout simulations to ensure zero overselling and proper inventory locks.

---

## 3. Frontend Testing & Type Safety

- **Type Checking**: Strict TypeScript validation (`tsc --noEmit`) across `apps/web` and `packages/shared-types`.
- **Linting**: ESLint and Tailwind class sorting.
- **E2E Smoke Test**: Playwright scenario covering:
  1. Merchant signs up.
  2. Completes onboarding questionnaire.
  3. Previews and publishes store.
  4. Customer visits `/store/{slug}`, adds product to cart, and completes checkout.
  5. Merchant verifies order appears in `/dashboard`.
