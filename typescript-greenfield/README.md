# TypeScript greenfield — checkout pricing

A small multi-module checkout pricing service with Forall specs, mapping, and
proof contracts on the money / shipping helpers.

## Layout

```text
.forall/
  verified/mapping.yaml
  specs/<capability>/spec.md
src/
  domain/
    money.ts       # verified helpers (//@ contracts)
    cart.ts / coupons.ts / tax.ts / shipping.ts / quote.ts / refunds.ts
    types.ts
  catalog/
    products.ts / storeConfig.ts
  api/
    quoteHandler.ts / refundHandler.ts / healthHandler.ts
  index.ts
```

## Run (TypeScript)

```bash
cd typescript-greenfield
npm install
npm run check
```

## Use with Forall

```bash
cd typescript-greenfield
forall check --root .
```

## Verified vs spec-tracked

| Tier | Modules |
|------|---------|
| Proved (`verified: true`) | `domain/money.ts` — line totals, discounts, cap, tax, shipping fee, refund and restocking-fee bounds |
| Spec-tracked | cart, coupons, tax lookup, shipping wiring, quote/refund composition, catalog, API |
