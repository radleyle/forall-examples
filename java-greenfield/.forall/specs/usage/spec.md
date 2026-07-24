# Metered usage

## Requirements

### Requirement: usage is bounded by the configured maximum
#### Scenario: excessive-usage
- **WHEN** reported usage exceeds the supported maximum
- **THEN** pricing uses the maximum supported usage

### Requirement: tier units stay within the reported usage
#### Scenario: progressive-tier
- **WHEN** usage is priced above a tier threshold
- **THEN** tier units are non-negative and no greater than total usage

### Requirement: tier units respect a tier cap
#### Scenario: finite-tier
- **WHEN** calculated units exceed the tier capacity
- **THEN** only the tier capacity is charged

### Requirement: a tier charge is non-negative and overflow-safe
#### Scenario: valid-units-and-rate
- **WHEN** units and cents-per-unit satisfy the explicit multiplication bound
- **THEN** the charge equals units times rate and remains within the money bound

### Requirement: invoice aggregation saturates at its configured cap
#### Scenario: additions-exceed-cap
- **WHEN** adding two valid amounts would pass the cap
- **THEN** the result equals the cap
