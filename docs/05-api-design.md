# 05 - REST API Specification

All endpoints are versioned under `/api/v1`. The backend generates interactive OpenAPI/Swagger documentation automatically at `/docs`.

---

## 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Login and receive access/refresh tokens | No |
| `POST` | `/api/v1/auth/refresh` | Exchange valid refresh token for access token | No |
| `POST` | `/api/v1/auth/logout` | Invalidate token session | Yes |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |

---

## 2. Store Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/stores` | Create a new store | Yes |
| `GET` | `/api/v1/stores/me` | Fetch current user's stores | Yes |
| `GET` | `/api/v1/stores/{slug}` | Public storefront endpoint (metadata & products) | No |
| `PATCH` | `/api/v1/stores/{store_id}` | Update store details & theme configuration | Yes (Owner) |
| `POST` | `/api/v1/stores/{store_id}/publish` | Toggle store publish status | Yes (Owner) |

---

## 3. Product Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/stores/{store_id}/products` | Create product within a store | Yes (Owner) |
| `GET` | `/api/v1/stores/{store_id}/products` | List products for merchant dashboard | Yes (Owner) |
| `GET` | `/api/v1/products/{product_id}` | Get product details | No |
| `PATCH` | `/api/v1/products/{product_id}` | Update product information/inventory | Yes (Owner) |
| `DELETE` | `/api/v1/products/{product_id}` | Delete a product | Yes (Owner) |

---

## 4. Order Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/stores/{store_id}/orders` | Place a customer order (Transaction-safe) | No |
| `GET` | `/api/v1/stores/{store_id}/orders` | List store orders for merchant | Yes (Owner) |
| `GET` | `/api/v1/orders/{order_id}` | Get single order details | Yes (Owner / Token) |
| `PATCH` | `/api/v1/orders/{order_id}/status` | Update fulfillment status | Yes (Owner) |

---

## 5. AI Endpoints (Optional Enhancement)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/ai/onboarding-generate` | Generate tagline, copy & starter products from questionnaire | Yes |
| `POST` | `/api/v1/ai/product-description` | Generate or polish product description | Yes |
| `POST` | `/api/v1/ai/product-title` | Suggest creative product titles | Yes |

---

## 6. System & Health Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service health, DB connection & Redis ping | No |
