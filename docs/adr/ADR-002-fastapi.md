# ADR-002: FastAPI for Backend API

## Status
Accepted

## Context
The backend must handle high concurrency, provide strongly typed data validation, auto-generate OpenAPI documentation, interface seamlessly with Python AI providers (Sarvam AI), and maintain clear domain separation.

## Decision
We choose **FastAPI with Python 3.11+, Pydantic v2, and SQLAlchemy 2.0 Async**.

## Consequences
### Positive
- Automatic, interactive OpenAPI documentation (`/docs` Swagger UI).
- Native Python async support (`async`/`await`) for high I/O throughput.
- Direct ecosystem integration with Python AI tooling and libraries.
- Strong runtime validation and type-checking via Pydantic v2.

### Negative
- Python requires deliberate async driver handling (`asyncpg` vs `psycopg2`) for migrations and test isolation.
