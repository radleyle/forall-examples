import { rolloutBucket } from "./hash.js";
import { isBucketIncluded, percentageToThreshold } from "./rollout.js";
import { firstMatchingRule } from "./targeting.js";
import type { Evaluation, EvaluationContext, FeatureFlag } from "./types.js";

export function evaluateFlag(flag: FeatureFlag, context: EvaluationContext): Evaluation {
  if (!flag.enabled) {
    return { flagKey: flag.key, value: flag.offValue, reason: "FLAG_DISABLED" };
  }

  const rule = firstMatchingRule(flag.rules, context);
  if (rule !== undefined) {
    return {
      flagKey: flag.key,
      value: rule.value,
      reason: "TARGETING_MATCH",
      ruleId: rule.id,
    };
  }

  const bucket = rolloutBucket(flag.key, context.subjectKey);
  const included = isBucketIncluded(bucket, percentageToThreshold(flag.rolloutPercentage));
  return {
    flagKey: flag.key,
    value: included ? flag.rolloutValue : flag.defaultValue,
    reason: included ? "ROLLOUT_MATCH" : "ROLLOUT_MISS",
    bucket,
  };
}
