# Rust brownfield inventory reservation

A production-shaped, dependency-light inventory reservation service organized
across domain, application, repository, event, and API-style boundaries. It
covers successful and rejected reservations, release, expiry, and idempotent
reserve retries. The in-memory repository uses a mutex-backed transaction
boundary so tests exercise realistic atomic orchestration.

## Brownfield adoption model

The application service, repository, event publisher, and API adapter represent
pre-existing brownfield code. Their behavior is specified and mapped, but not
marked formally verified: concurrency, persistence atomicity, and event ordering
need richer models than a first incremental proof should attempt.

Formal adoption starts with `src/domain/verified_core.rs`, a narrow pure core for
numeric state transitions. Eleven requirements are marked `verified: true`;
six integration requirements remain spec-tracked. The single authoritative
mapping is `.forall/verified/mapping.yaml`, the legacy working layout consumed
by the installed `forall-cli 0.0.0`.

## Rust and Verus compatibility

Verus contract syntax (`requires`/`ensures`) is not standard Rust syntax. The
verified core therefore contains two configuration-selected definitions:

- standard `rustc` compiles the `cfg(not(verus))` pure implementations;
- Verus selects equivalent definitions inside `verus!` with inline contracts.

`cargo test` validates the production Rust branch, but does **not** prove those
contracts. A successful hosted `forall_verify`/Verus run is required before
calling the mapped requirements machine-checked. `Cargo.toml` declares
`[package.metadata.verus] verify = true`; the hosted Verus environment supplies
`vstd` when `cfg(verus)` is selected.

## Layout

- `src/domain/` — entities, errors, and pure verified transition core
- `src/application/` — reserve/release/expiry orchestration
- `src/repository/` — transactional repository port and in-memory adapter
- `src/events/` — event port, event types, and recording adapter
- `src/api/` — transport-neutral HTTP-style handlers
- `tests/` — end-to-end application tests
- `.forall/specs/` — capability requirements and exact scenarios
- `.forall/verified/` — Verus adapter configuration and authoritative mapping

## Checks

```sh
cargo fmt --check
cargo test
cargo clippy --all-targets -- -D warnings
forall check
```

Run the exact verification command from this directory:

```sh
forall check --root . --json
```

The command discovers the project through `.forall/config.toml`, reads
`.forall/verified/mapping.yaml`, and routes verified Rust obligations through
the `verus` adapter configured in `.forall/verified/config.yaml`. Neither a
passing Cargo test nor mapping validation alone is a formal proof. Report the
eleven verified requirements as machine-checked only after this command returns
a successful Verus report.
