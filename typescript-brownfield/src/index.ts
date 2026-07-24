export { createEvaluateHandler } from "./api/evaluateHandler.js";
export type { HttpRequest, HttpResponse } from "./api/types.js";
export { EvaluateFeature } from "./application/evaluateFeature.js";
export type { EvaluateFeatureRequest } from "./application/evaluateFeature.js";
export { normalizeConfiguration } from "./config/normalize.js";
export { validateConfiguration } from "./config/validate.js";
export { evaluateFlag } from "./domain/evaluate.js";
export type {
  Evaluation,
  EvaluationContext,
  EvaluationReason,
  FeatureFlag,
  FlagValue,
  TargetingRule,
} from "./domain/types.js";
export { InMemoryAuditSink } from "./infrastructure/auditSink.js";
export { InMemoryFlagRepository } from "./infrastructure/inMemoryFlagRepository.js";
