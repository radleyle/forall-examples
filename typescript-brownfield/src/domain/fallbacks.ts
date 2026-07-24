import type { Evaluation, FlagValue } from "./types.js";
import { selectNonNegativeFallback } from "./verifiedCore.js";

export function normalizeFallbackNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? selectNonNegativeFallback(value, fallback) : fallback;
}

export function missingFlagEvaluation(flagKey: string, fallback: FlagValue): Evaluation {
  return { flagKey, value: fallback, reason: "FLAG_NOT_FOUND" };
}

export function invalidContextEvaluation(flagKey: string, fallback: FlagValue): Evaluation {
  return { flagKey, value: fallback, reason: "INVALID_CONTEXT" };
}

export function repositoryErrorEvaluation(flagKey: string, fallback: FlagValue): Evaluation {
  return { flagKey, value: fallback, reason: "REPOSITORY_ERROR" };
}
