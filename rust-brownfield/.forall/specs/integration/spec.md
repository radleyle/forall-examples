# Brownfield integration

## Requirements

### Requirement: Domain events SHALL be published only after repository success.
#### Scenario: post-commit-event
- **WHEN** repository mutation fails
- **THEN** no success event is published

### Requirement: API errors SHALL map to stable HTTP-style status classes.
#### Scenario: error-contract
- **WHEN** the application returns a known domain error
- **THEN** the adapter returns its documented HTTP-style status
