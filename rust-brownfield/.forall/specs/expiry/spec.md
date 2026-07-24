# Expiry

## Requirements

### Requirement: A valid expiry transition SHALL restore available stock, reduce reserved stock, and conserve total stock.
#### Scenario: expiry-transition-invariants
- **WHEN** an active due reservation expires
- **THEN** its quantity moves from reserved to available without changing total stock

### Requirement: A reservation SHALL be expired exactly when the current time reaches its deadline.
#### Scenario: deadline-reached
- **WHEN** now is equal to or later than the expiry deadline
- **THEN** the reservation is expired

### Requirement: An expired deadline SHALL remain expired as time advances.
#### Scenario: remains-due
- **WHEN** a reservation is expired at a time
- **THEN** it remains expired at every later time

### Requirement: A positive fitting TTL SHALL produce a later expiry deadline without arithmetic overflow.
#### Scenario: bounded-deadline
- **WHEN** a positive TTL fits above the current timestamp
- **THEN** the deadline is later than the current timestamp without overflow

### Requirement: Expiry processing SHALL change only active due reservations.
#### Scenario: skip-ineligible
- **WHEN** a reservation is not due or is already terminal
- **THEN** expiry processing leaves it unchanged
