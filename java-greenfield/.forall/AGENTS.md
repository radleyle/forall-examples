# Java subscription billing

Implement from `.forall/specs/` before changing delivery behavior. Monetary values are
integer cents, rates are basis points, and usage is an integer quantity.

- Keep formally verified requirements on public static scalar helpers in the
  capability-focused `UsageMath`, `AdjustmentMath`, `TaxMath`, and `InvoiceMath` classes.
- Put `//@ requires` and `//@ ensures` contracts directly above their methods.
- Keep `.forall/verified/mapping.yaml` as the single authoritative requirement mapping,
  with each verified `mapping.contract` matching its extracted OpenJML contract exactly.
- Keep collection aggregation, repository state, and delivery orchestration spec-tracked
  with `verified: false`.
- Do not weaken a verified requirement to make a proof pass.
- Run the assertion harness after every behavior change.
