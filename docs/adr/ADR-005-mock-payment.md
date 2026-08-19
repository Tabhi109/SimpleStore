# ADR-005: Mock Payment Workflow for V1

## Status
Accepted

## Context
Integrating live payment gateways (e.g. Razorpay, Stripe) adds webhook verification, merchant compliance verification, and test credential overhead that distracts from the core engineering goal: demonstrating simple store creation, theme switching, transaction-safe ordering, and clean architecture.

## Decision
We implement a **Mock Payment Workflow** for initial development. The checkout action completes with payment status `demo_paid` while executing full server-side pricing recalculation, inventory locks, and order creation.

## Consequences
### Positive
- Zero external friction: Anyone evaluating the portfolio can complete an end-to-end checkout immediately without setting up sandbox cards.
- Full architectural rigor: Server-side pricing validation and transaction handling are fully exercised.
- Clean extension point: Gateway webhooks and Razorpay SDK can be slotted in later without rewriting the checkout domain model.

### Negative
- Not connected to real banking rails.
