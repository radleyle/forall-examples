# Rollout

## Requirements

### Requirement: The service SHALL produce unsigned stable hashes
#### Scenario: Any subject key
- **WHEN** a subject key is hashed
- **THEN** the result is non-negative

### Requirement: The service SHALL keep rollout buckets within the ten-thousand bucket range
#### Scenario: Any unsigned hash
- **WHEN** an unsigned hash is bucketed
- **THEN** the result is at least zero and less than 10000

### Requirement: The service SHALL clamp percentages to the supported range
#### Scenario: Any numeric percentage
- **WHEN** a percentage is normalized
- **THEN** the result is between 0 and 100

### Requirement: The service SHALL keep rollout thresholds within the ten-thousand bucket range
#### Scenario: Valid percentage
- **WHEN** a percentage between 0 and 100 is converted
- **THEN** the threshold is between 0 and 10000

### Requirement: The service SHALL make rollout inclusion exactly follow the threshold comparison
#### Scenario: Valid bucket and threshold
- **WHEN** inclusion is evaluated
- **THEN** it is true exactly when the bucket is below the threshold

### Requirement: The service SHALL make repeated evaluation deterministic
#### Scenario: Generated flags and contexts
- **WHEN** the same flag and context are evaluated twice
- **THEN** both evaluation records are deeply equal

### Requirement: The service SHALL select the first matching targeting rule
#### Scenario: Multiple targeting rules
- **WHEN** a context matches more than one targeting rule
- **THEN** the first matching rule is selected
