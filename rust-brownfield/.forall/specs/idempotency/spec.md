# Idempotency

## Requirements

### Requirement: Reserve idempotency SHALL replay matching requests and reject conflicting key reuse without duplicate stock changes or events.
#### Scenario: exact-replay
- **WHEN** SKU, quantity, TTL, and idempotency key match an earlier request
- **THEN** the original result is returned without another stock change or event

#### Scenario: conflicting-replay
- **WHEN** a key is reused with a different SKU, quantity, or TTL
- **THEN** the request fails with an idempotency conflict
