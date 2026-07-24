# Configuration

## Requirements

### Requirement: The service SHALL normalize configuration versions to positive integers
#### Scenario: Arbitrary numeric version
- **WHEN** a version is normalized
- **THEN** it is an integer of at least one

### Requirement: The service SHALL normalize rule priorities to non-negative integers
#### Scenario: Arbitrary numeric priority
- **WHEN** a priority is normalized
- **THEN** it is a non-negative integer

### Requirement: The service SHALL keep numeric fallbacks non-negative
#### Scenario: Invalid or valid value
- **WHEN** a numeric value is selected against a non-negative fallback
- **THEN** the result remains non-negative

### Requirement: The service SHALL not crash on arbitrary configuration input
#### Scenario: Generated unknown input
- **WHEN** any generated JavaScript value is normalized and validated
- **THEN** processing completes without throwing

### Requirement: The service SHALL make flag normalization idempotent
#### Scenario: Generated unknown input
- **WHEN** a normalized flag is normalized again
- **THEN** the flag remains deeply equal

### Requirement: The service SHALL reject invalid and duplicate flag definitions
#### Scenario: Malformed configuration
- **WHEN** normalized flags have missing keys, duplicate keys, or malformed rules
- **THEN** validation returns path-addressed issues
