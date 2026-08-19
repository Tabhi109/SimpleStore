# ADR-001: Next.js App Router for Frontend

## Status
Accepted

## Context
SimpleStore requires a fast, responsive public storefront (`/store/{slug}`) as well as an interactive merchant onboarding and dashboard. We need a framework that provides server-side rendering (SSR), static optimization, robust routing, and great developer experience with modern React patterns.

## Decision
We choose **Next.js 14 with App Router and TypeScript**.

## Consequences
### Positive
- Server Components enable fast, lightweight storefront rendering with minimal JavaScript sent to the client.
- Dynamic route segment matching (`/store/[slug]`) provides clean, performant routing.
- Native integration with Tailwind CSS and Radix UI / shadcn/ui primitives.
- High SEO performance and rapid First Contentful Paint (FCP).

### Negative
- Requires maintaining client vs. server component boundaries (`'use client'`).
- Slightly steeper learning curve than simple static SPAs.
