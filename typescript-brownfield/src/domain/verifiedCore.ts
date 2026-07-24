/**
 * Small numeric helpers kept free of JavaScript-only built-ins so LemmaScript can
 * translate the production-critical bounds to Dafny.
 */

export function asUnsignedStableHash(hash: number): number {
  //@ requires -2147483648 <= hash && hash <= 4294967295
  //@ ensures 0 <= \result && \result <= 4294967295
  //@ contract StableHashUnsigned asUnsignedStableHash
  if (hash < 0) return hash + 4_294_967_296;
  return hash;
}

export function hashToBucket(hash: number): number {
  //@ requires hash >= 0
  //@ ensures 0 <= \result && \result < 10000
  //@ contract HashBucketBounds hashToBucket
  return hash % 10_000;
}

export function clampFinitePercentage(percentage: number): number {
  //@ ensures 0 <= \result && \result <= 100
  //@ contract PercentageBounds clampFinitePercentage
  if (percentage < 0) return 0;
  if (percentage > 100) return 100;
  return percentage;
}

export function percentageToThreshold(percentage: number): number {
  //@ requires 0 <= percentage && percentage <= 100
  //@ ensures 0 <= \result && \result <= 10000
  //@ contract RolloutThresholdBounds percentageToThreshold
  return Math.floor(percentage * 100);
}

export function isBucketIncluded(bucket: number, threshold: number): boolean {
  //@ requires 0 <= bucket && bucket < 10000
  //@ requires 0 <= threshold && threshold <= 10000
  //@ ensures \result == (bucket < threshold)
  //@ contract RolloutInclusion isBucketIncluded
  return bucket < threshold;
}

export function normalizeFiniteVersion(version: number): number {
  //@ ensures \result >= 1
  //@ contract ConfigVersionPositive normalizeFiniteVersion
  if (version < 1) return 1;
  return Math.floor(version);
}

export function normalizeFiniteRulePriority(priority: number): number {
  //@ ensures \result >= 0
  //@ contract RulePriorityNonNegative normalizeFiniteRulePriority
  if (priority < 0) return 0;
  return Math.floor(priority);
}

export function selectNonNegativeFallback(value: number, fallback: number): number {
  //@ requires fallback >= 0
  //@ ensures \result >= 0
  //@ contract NonNegativeFallback selectNonNegativeFallback
  if (value >= 0) return value;
  return fallback;
}
