# Java greenfield subscription billing

A dependency-light Java 17 example shaped around domain, application, repository, and
delivery boundaries. It prices progressive metered usage, prorates recurring charges,
applies capped percentage discounts and credits, calculates tax, caps the payable amount,
persists consumed credit, and assembles auditable invoice lines. Money is always integer
cents and rates are always integer basis points.

## Specs-first workflow

The behavior starts in `.forall/specs/`. Its requirement mapping deliberately separates:

- 12 `verified: true` scalar arithmetic requirements mapped to public static helpers in
  `UsageMath`, `AdjustmentMath`, `TaxMath`, and `InvoiceMath`, each with OpenJML
  `requires`/`ensures` contracts and explicit overflow bounds.
- 3 `verified: false` requirements for collection aggregation, persistence, and delivery.
  These remain spec-tracked because they cross stateful or collection-oriented boundaries.

When changing behavior, update the capability spec and
`.forall/verified/mapping.yaml` first, then implement the smallest domain helper before
wiring it into `BillingService` and `BillingEndpoint`.

## Boundaries

- `domain`: policies, immutable invoice values, usage tiers, shared billing limits, and
  capability-focused pure arithmetic.
- `application`: validated billing input and invoice orchestration.
- `repository`: persistence port plus a thread-safe in-memory adapter.
- `delivery`: framework-neutral request, response, and endpoint adapter.

There are 19 production Java files and one executable assertion harness.

## Build and run

```sh
mvn clean test-compile
java -ea -cp target/classes:target/test-classes dev.forall.billing.BillingEngineAssertions
```

If Maven is unavailable, the dependency-free fallback performs the same compile and run:

```sh
sh check.sh
```

The project intentionally has no runtime or test dependencies.

## Forall verification

The legacy Forall project layout is rooted by `.forall/config.toml`. Runtime policy is in
`.forall/config.yaml`, the Java `openjml` adapter is selected in
`.forall/verified/config.yaml`, and `.forall/verified/mapping.yaml` is the single
authoritative requirement mapping. The pure proof slice is split across `UsageMath.java`
(usage bounds and tier pricing), `AdjustmentMath.java` (discounts, proration, and credits),
`TaxMath.java` (taxable base and tax), and `InvoiceMath.java` (bounded aggregation).

From `java-greenfield`, run:

```sh
forall check --root . --json
```

The installed `forall-cli 0.0.0` checks intent, mapping, scenarios, structure, and all 12
OpenJML proof obligations. Property and scenario test phases are skipped because this
example maps formal scalar proofs and manual boundary scenarios rather than property-test
executables.
