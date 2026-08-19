# ADR-003: PostgreSQL as Relational Source of Truth

## Status
Accepted

## Context
E-commerce applications require strong transactional consistency for inventory allocation and order preservation. We need a reliable database engine with native JSON support for flexible theme configs and onboarding context.

## Decision
We choose **PostgreSQL 16** as the single primary relational database.

## Consequences
### Positive
- Strict ACID compliance prevents inventory overselling during concurrent checkout attempts.
- Native `JSONB` support allows storing structured `theme_config` and `onboarding_context` without sacrificing relational integrity for core entities (Users, Stores, Products, Orders).
- Rich indexing (B-Tree, GIN) and foreign key cascades maintain referential integrity.

### Negative
- Requires schema migrations via Alembic as the domain model evolves.
