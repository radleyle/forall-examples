# Release

## Requirements

### Requirement: Release SHALL be admissible exactly when quantity is positive, reserved, and safe to add to available stock.
#### Scenario: releasable-quantity
- **WHEN** a positive quantity is within reserved stock and fits in available stock
- **THEN** the release is admissible

### Requirement: A valid release transition SHALL restore available stock, reduce reserved stock, and conserve total stock.
#### Scenario: release-transition-invariants
- **WHEN** a valid reserved quantity is released
- **THEN** available increases, reserved decreases, and their sum is unchanged

### Requirement: Only an active reservation SHALL transition to released.
#### Scenario: no-double-release
- **WHEN** release is repeated
- **THEN** the second operation is rejected without changing stock
