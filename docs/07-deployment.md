# 07 - Deployment & Infrastructure

## 1. Containerization Strategy
SimpleStore uses multi-stage Docker builds to produce lightweight, production-ready images for both the frontend (Next.js) and backend (FastAPI).

### Services Overview
- **`web`**: Next.js 14 standalone container running on port 3000.
- **`api`**: FastAPI Uvicorn container running on port 8000.
- **`db`**: PostgreSQL 16 Alpine container with persistent volume storage (`pgdata`).
- **`redis`**: Redis 7 Alpine container for caching and rate limiting.
- **`nginx`**: Optional reverse proxy routing `/api/*` to FastAPI and `/*` to Next.js.

---

## 2. Docker Compose Specifications

- **`docker-compose.yml`**: Designed for zero-friction local development with volume mounts for live hot-reloading.
- **`docker-compose.prod.yml`**: Optimized for production environments with minimized images, read-only containers, health checks, and restart policies.

---

## 3. Continuous Integration (GitHub Actions)

`.github/workflows/ci.yml` automates the following on every push and pull request:
1. **Frontend Lint & Type-Check**: Runs ESLint and TypeScript compiler (`tsc --noEmit`) on `apps/web`.
2. **Backend Lint & Format Check**: Runs `ruff check` on `apps/api`.
3. **Backend Test Suite**: Runs `pytest` against an ephemeral PostgreSQL and Redis test container.
4. **Docker Build Sanity**: Validates that all Dockerfiles compile without errors.
