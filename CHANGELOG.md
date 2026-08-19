# Changelog

All notable changes to the SimpleStore project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-19

### Added
- **Monorepo Architecture**: Setup directory structure for `apps/web` (Next.js), `apps/api` (FastAPI), and `packages/shared-types`.
- **Backend Foundation**:
  - FastAPI modular application setup with async SQLAlchemy 2.0 and Pydantic Settings.
  - Core JWT security, password hashing, and dependency injection utilities.
  - Health check endpoints (`/api/v1/health`) with live PostgreSQL and Redis status inspection.
  - Pytest test harness covering health status and token security.
  - Alembic database migration environment.
- **Frontend Foundation**:
  - Next.js 14 App Router with TypeScript, Tailwind CSS, and shadcn/ui-inspired primitives.
  - Type-safe API client wrapper with standardized error handling.
  - Interactive System Health & Platform Status landing view.
- **Documentation Suite**:
  - Complete `docs/00` to `08` technical specifications covering project charter, requirements, user journeys, architecture, database schemas, REST APIs, AI integration, deployment, and testing.
  - Architecture Decision Records (`ADR-001` to `ADR-005`).
- **DevOps & Infrastructure**:
  - Multi-service `docker-compose.yml` for local development (Next.js, FastAPI, PostgreSQL 16, Redis 7).
  - Production container recipes and Nginx reverse proxy configuration.
  - GitHub Actions CI workflow for linting, type-checking, and test execution.
- **Engineering Principles**: Created `PROJECT_RULES.md` defining 12 core development guidelines.
