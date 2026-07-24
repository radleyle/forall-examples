# Refunds

## Requirements

### Requirement: a refund never exceeds either the captured payment or requested amount

#### Scenario: refund-capped-to-payment

- **WHEN** a requested refund exceeds the captured payment
- **THEN** the gross refund equals the captured payment
- **AND** remains non-negative

### Requirement: a restocking fee between zero and one hundred percent never exceeds the refund

#### Scenario: bounded-restocking-fee

- **WHEN** a restocking fee between 0 and 10,000 basis points is applied
- **THEN** the fee is non-negative
- **AND** does not exceed the gross refund

### Requirement: net refund equals gross refund minus the restocking fee

#### Scenario: net-refund-composition

- **WHEN** a refund quote is built
- **THEN** the net refund equals the gross refund minus the restocking fee

### Requirement: POST /refund validates input and returns a refund quote

#### Scenario: valid-refund-request

- **WHEN** a valid refund request is submitted
- **THEN** the handler returns the calculated refund quote

#### Scenario: invalid-refund-request

- **WHEN** monetary or basis-point values are invalid
- **THEN** the handler returns a validation error
