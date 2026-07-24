# Forall examples

Production-shaped examples for [Forall](https://github.com/astrio-labs/forall),
organized as `{language}-{adoption-style}`.

- [typescript-greenfield](./typescript-greenfield/) — a specs-first checkout
  pricing and refund engine with LemmaScript/Dafny contracts.
- [typescript-brownfield](./typescript-brownfield/) — incremental adoption in
  an existing feature-flag service, combining formal contracts, property tests,
  and spec-tracked boundaries.
- [rust-brownfield](./rust-brownfield/) — a reservation service that introduces
  Verus proofs around a pure inventory transition core.
- [java-greenfield](./java-greenfield/) — a specs-first subscription billing
  engine with OpenJML contracts on money and usage calculations.

## What the examples demonstrate

Each project separates three levels of assurance:

1. **Formal-proof targets** map deterministic domain invariants to contracts
   that a Forall proof run can machine-check.
2. **Property-tested** requirements exercise large or unbounded input spaces
   with reproducible generators.
3. **Spec-tracked** requirements keep I/O, persistence, concurrency, and
   orchestration visible without overstating what has been formally proved.

The examples intentionally keep realistic application boundaries around a
narrow verified core. See each project README for its architecture, local
build commands, proof scope, and Forall workflow. A `verified: true` mapping
declares a proof obligation; only a successful proofs phase establishes that
the obligation was machine-checked.
