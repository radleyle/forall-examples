# Adjustments

## Requirements

### Requirement: percentage discounts stay within subtotal
#### Scenario: valid-basis-points
- **WHEN** a discount rate is between zero and 10000 basis points
- **THEN** the discount is between zero and subtotal

### Requirement: discount caps limit savings
#### Scenario: proposed-discount-exceeds-cap
- **WHEN** a proposed discount exceeds subtotal or the configured cap
- **THEN** the applied discount is limited by both

### Requirement: proration stays within the full amount
#### Scenario: partial-active-period
- **WHEN** active days are between zero and total period days
- **THEN** the prorated charge is between zero and the full charge

### Requirement: credits cannot exceed the amount due
#### Scenario: credit-balance-exceeds-charge
- **WHEN** available credit is greater than the post-discount charge
- **THEN** only the charge amount is applied

### Requirement: taxable base excludes valid discounts and credits
#### Scenario: adjusted-taxable-charge
- **WHEN** discount and credit do not exceed the subtotal
- **THEN** taxable base equals subtotal minus both adjustments

### Requirement: tax is non-negative, bounded, and overflow-safe
#### Scenario: valid-tax-basis-points
- **WHEN** taxable cents and tax basis points satisfy the explicit multiplication bound
- **THEN** tax stays between zero and taxable cents

### Requirement: invoice totals respect the account cap
#### Scenario: total-exceeds-cap
- **WHEN** an assembled total exceeds the account cap
- **THEN** the payable total equals the cap
