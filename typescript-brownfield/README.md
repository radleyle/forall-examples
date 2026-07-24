# TypeScript brownfield feature flags

This example treats the feature-flag evaluator as an existing production service rather than
a clean-sheet implementation. It has recognizable boundaries, compatibility fallbacks, audit
reasons, configuration cleanup, repository I/O, and an HTTP adapter. Forall is adopted
incrementally: small deterministic helpers receive formal contracts first, broad data-shape
risks are covered by property tests, and orchestration stays spec-tracked until its dependencies
can be isolated further.

## Service shape

```text
src/
  domain/          flag types, targeting, rollout hashing, fallback and evaluation logic
  config/          untrusted configuration normalization and validation
  application/     repository-to-domain evaluation use case and audit recording
  infrastructure/  repository and audit ports with in-memory adapters
  api/             transport-neutral HTTP request/response adapter
```

Evaluation order is disabled flag, first matching targeting rule, deterministic percentage
rollout, then the configured default. Missing flags, invalid contexts, and repository failures
return the caller-provided fallback with distinct audit reasons. Assignment uses a stable hash
of the flag and subject keys and 10,000 buckets, avoiding process-random behavior.

## Incremental Forall layout

- `.forall/specs/` records capability requirements in user-visible terms.
- `.forall/verified/mapping.yaml` is the authoritative mapping from every requirement to real
  code; its tier is inferred from
  `verified`, `property_tested`, or a spec-only mapping.
- `.forall/verified/config.yaml` selects Dafny with the `lemmascript-dafny` TypeScript adapter,
  and `.forall/config.toml` identifies the mapping as the project root marker.
- Eight pure numeric invariants use `//@ requires`, `//@ ensures`, and `//@ contract`.
- Three higher-dimensional invariants use fast-check scenarios from `.forall/scenarios/`.
- Configuration validation, targeting precedence, repository behavior, auditing, and HTTP
  behavior are spec-tracked because they cross object or I/O boundaries.

Property runs are reproducible:

```sh
FORALL_PBT_SEED=1234 FORALL_PBT_EXAMPLES=500 npm run test:properties
```

Each scenario default-exports an async runner that resolves to `{ ok, counterexample?, seed?,
examplesRun? }`; named exports are retained for the local aggregate runner.

## Run

Requires Node.js 20 or newer.

```sh
npm install
npm run verify
npm run build
```

`npm run verify` performs strict type-checking, focused unit tests, and all property scenarios.

## Forall verification

With the locally installed `forall-cli`, run:

```sh
forall check --root . --json
```

The `.forall/verified/` structure matches the layout consumed by that CLI.
The property runners are also exercised by `npm run verify`; `verified: true`
entries are machine-checked by the formal proof phase of `forall check`.
