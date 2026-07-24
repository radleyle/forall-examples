# Forall

Treat repository, locking, event publication, and API adapters as brownfield
integration code. Keep them spec-tracked while incrementally proving only the
pure functions in `src/domain/verified_core.rs`.

Author the single authoritative mapping in `.forall/verified/mapping.yaml`.
Run `forall check --root . --json` for Verus machine checking before saying
“Forall verified.” Passing `cargo test` checks the standard-Rust branch only.
