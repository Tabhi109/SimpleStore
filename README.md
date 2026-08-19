# SimpleStore 🛍️

> **"Your store. Without the complexity."**

SimpleStore is a small, polished, production-grade web application designed to demonstrate full-stack engineering excellence, clean software architecture, SaaS fundamentals, and purposeful AI integration.

SimpleStore allows a creator or small business owner to launch a storefront in **under 5 minutes** through a guided questionnaire and pre-defined, beautiful UI themes, backed by a transaction-safe backend.

---

## 🏛️ Architecture Overview

SimpleStore is built as a **Modular Monolith**:

```
Browser (Customer / Merchant)
       │
       ▼
Next.js 14 (App Router, Tailwind, shadcn/ui primitives, TanStack Query, Zustand)
       │
       │ HTTPS / REST (Typed API Client)
       ▼
FastAPI (Python, Pydantic, SQLAlchemy 2.0 Async, JWT Auth, Alembic)
       │
       ├──► PostgreSQL 16 (Relational Source of Truth, ACID Transactions)
       ├──► Redis 7 (Storefront Cache & Rate Limiting)
       ├──► Object Storage (S3-Compatible Uploads via Presigned URLs)
       └──► Sarvam AI (Optional Copy & Starter Product Draft Generation)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: `v20+` or `v22+`
- **Python**: `3.11+`
- **Docker & Docker Compose**: v2+

### Option A: Run Full Stack with Docker Compose (Recommended)

1. **Clone & Configure Environment**:
   ```bash
   cp .env.example .env
   ```

2. **Start All Services**:
   ```bash
   docker compose up --build
   ```

3. **Access Services**:
   - **Frontend (Web)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Option B: Run Services Locally

1. **Start PostgreSQL and Redis in Docker**:
   ```bash
   docker compose up -d db redis
   ```

2. **Setup & Run Backend (`apps/api`)**:
   ```bash
   cd apps/api
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Setup & Run Frontend (`apps/web`)**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

---

## 🧪 Testing & Verification

### Run Backend Tests (Pytest)
```bash
cd apps/api
pytest
```

### Run Frontend Lint & Type Checks
```bash
cd apps/web
npm run type-check
npm run lint
```

---

## 📁 Repository Structure

```
SimpleStore/
├── apps/
│   ├── web/                     # Next.js 14 App Router
│   └── api/                     # FastAPI Backend
├── packages/
│   └── shared-types/            # Shared TypeScript type definitions
├── docs/                        # Complete technical architecture docs (00 to 08 + ADRs)
├── infra/
│   ├── docker/                  # Multi-stage Docker definitions
│   └── nginx/                   # Reverse proxy configuration
├── scripts/                     # Local developer helper scripts
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Local multi-service environment
├── PROJECT_RULES.md             # Core engineering rules & constraints
└── CHANGELOG.md                 # Version changelog
```

---

## 📜 Key Engineering Rules

1. **SimpleStore is NOT Shopify**: No complex app ecosystems or drag-and-drop page builders.
2. **PostgreSQL is the source of truth**: Orders and inventory use strict database-level transactions.
3. **AI is an optional enhancement**: Backend handles all business logic; AI never directly modifies prices, creates orders, or runs untrusted client code.
4. **Never trust client-side prices**: Backend re-fetches product records from PostgreSQL and calculates all subtotals server-side.

See [PROJECT_RULES.md](file:///Users/abhi/Desktop/Projects/SimpleStore/PROJECT_RULES.md) for the complete list of 12 engineering rules.
