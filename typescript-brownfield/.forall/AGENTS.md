# Forall guidance

- Treat this directory as an existing feature-flag service receiving incremental verification.
- Preserve API, application, and repository boundaries; do not move I/O into pure domain helpers.
- Express each mapped requirement in one tier: `verified: true`, `property_tested: true`,
  or spec-tracked with `verified: false`.
- Formal contracts belong on deterministic numeric helpers and use TypeScript
  `//@ requires`, `//@ ensures`, and `//@ contract` annotations.
- Property scenarios must use top-level `property` linkage, honor `FORALL_PBT_SEED` and
  `FORALL_PBT_EXAMPLES`, and default-export structured asynchronous runners.
- Run `npm run verify` after changes.
