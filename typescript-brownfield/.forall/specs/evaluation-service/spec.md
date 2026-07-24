# Evaluation service

## Requirements

### Requirement: The service SHALL construct missing-flag evaluations with the caller fallback
#### Scenario: Unknown flag key
- **WHEN** a flag key is missing
- **THEN** the caller fallback is returned with `FLAG_NOT_FOUND`

### Requirement: The service SHALL construct repository-error evaluations with the caller fallback
#### Scenario: Repository read failure
- **WHEN** a repository read fails
- **THEN** the caller fallback is returned with `REPOSITORY_ERROR`

### Requirement: The service SHALL construct invalid-context evaluations with the caller fallback
#### Scenario: Blank subject key
- **WHEN** an evaluation context is invalid
- **THEN** the caller fallback is returned with `INVALID_CONTEXT`

### Requirement: The HTTP handler SHALL validate requests and delegate evaluation
#### Scenario: POST evaluation request
- **WHEN** a well-formed request names a flag and evaluation context
- **THEN** the handler returns the application result as JSON
