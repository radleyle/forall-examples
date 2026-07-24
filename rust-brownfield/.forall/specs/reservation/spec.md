# Reservation

## Requirements

### Requirement: A reserve request SHALL be admissible exactly when its quantity is positive and no greater than available stock.
#### Scenario: valid-capacity
- **WHEN** available stock is 10 and quantity is 4
- **THEN** the reservation is admissible

### Requirement: A valid reserve transition SHALL move quantity from available to reserved while preserving total stock and capacity bounds.
#### Scenario: reserve-transition-invariants
- **WHEN** quantity is positive, within available stock, and arithmetic fits in u64
- **THEN** available decreases, reserved increases, total stock is conserved, and available does not grow

### Requirement: A rejected reserve transition SHALL leave both available and reserved stock unchanged.
#### Scenario: rejected-transition
- **WHEN** quantity is zero or exceeds available stock
- **THEN** available and reserved are unchanged

### Requirement: Total stock SHALL equal the overflow-safe sum of available and reserved stock.
#### Scenario: total-stock
- **WHEN** available plus reserved fits in u64
- **THEN** total stock equals their sum and is at least each counter

### Requirement: Stock state validity SHALL hold exactly when overflow-safe total stock does not exceed capacity.
#### Scenario: capacity-validity
- **WHEN** the stock counters can be safely added
- **THEN** the state is valid exactly when their sum does not exceed capacity

### Requirement: Repository transactions SHALL atomically serialize writes to prevent partial state and overselling.
#### Scenario: serialized-atomic-write
- **WHEN** competing requests target the same SKU
- **THEN** the repository serializes complete inventory and reservation mutations
