# 01 - Product Requirements Document (PRD)

## 1. User Personas
- **The Merchant (Creator / Small Business Owner)**: Needs a fast, painless way to list products and start selling without dealing with complex e-commerce setups, themes, or coding.
- **The Customer (Buyer)**: Visits a clean, branded public storefront, views product details, adds items to cart, and completes a fast order.

---

## 2. Core Functional Requirements

### 2.1 Merchant Onboarding & Store Creation
- **Signup & Authentication**: Secure JWT-based email/password registration and login.
- **Questionnaire-Driven Setup**:
  - Merchant provides Store Name, Category, Tone/Vibe (e.g. Minimal, Warm, Editorial, Bold), and Sample Product description.
  - Context is persisted in PostgreSQL (`onboarding_context`).
- **AI-Assisted Initial Generation**:
  - Automatically suggests store tagline, compelling description, and 2–3 starter products with recommended pricing.
  - Automatically recommends a matching theme configuration.
- **Theme Selection**: Merchant chooses between 4 pre-defined visual archetypes (Minimal, Editorial, Warm, Bold) with instant live preview.
- **Publishing**: 1-click publish making the storefront publicly accessible at `/store/{slug}`.

### 2.2 Product Management
- Create, view, update, and delete products (Name, Slug, Price, Inventory, Description, Image URL, Published status).
- AI helper button: *"Write it for me"* to generate or polish product descriptions based on title and key bullet points.
- Merchant can edit all AI-generated content before saving.

### 2.3 Public Storefront
- Clean, responsive public route `/store/{slug}` with pre-defined theme styling.
- Product detail pages with image galleries and inventory availability.
- Client-side persistent cart (localStorage).

### 2.4 Checkout & Order Lifecycle
- Frictionless checkout: Customer enters Name, Email, Phone, and Shipping Address.
- **Server-Side Validation**: Backend independently fetches product prices and verifies inventory within a database transaction.
- **Mock Payment Mode**: Order is created with status `demo_paid` and inventory is decremented atomically.
- **Order Confirmation Page**: Shows summary, order ID, items purchased, and status.

### 2.5 Merchant Dashboard
- **Overview**: Recent orders, total sales, active products.
- **Products**: List, filter, create, edit product inventory/prices.
- **Orders**: View order details and update fulfillment status (`pending`, `fulfilled`, `cancelled`).
- **Appearance**: Switch between pre-defined theme archetypes and color palettes.
- **Settings**: Update store name, description, logo, and publishing toggle.
