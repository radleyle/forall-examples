# Delivery

## Requirements

### Requirement: the delivery endpoint validates requests and returns invoice values
#### Scenario: valid-billing-request
- **WHEN** the endpoint receives a valid request for a known subscription
- **THEN** it returns an invoice response expressed entirely in integer cents
