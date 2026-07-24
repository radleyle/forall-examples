# Invoice assembly

## Requirements

### Requirement: billing assembles a deterministic invoice from subscription policy and usage
#### Scenario: active-subscription
- **WHEN** a known subscription is billed for a valid period and usage quantity
- **THEN** the invoice contains base, usage, discount, credit, and tax components whose total is capped

### Requirement: applied credits are persisted
#### Scenario: credit-consumed
- **WHEN** invoice assembly applies account credit
- **THEN** the repository stores the subscription with the remaining credit balance
