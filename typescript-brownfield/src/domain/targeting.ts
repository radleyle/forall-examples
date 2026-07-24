import type { EvaluationContext, FlagValue, TargetingRule } from "./types.js";

export function valuesEqual(left: FlagValue, right: FlagValue): boolean {
  return typeof left === typeof right && left === right;
}

export function matchesRule(rule: TargetingRule, context: EvaluationContext): boolean {
  const actual = context.attributes[rule.attribute];
  if (actual === undefined) return false;
  if (rule.operator === "equals") {
    const expected = rule.values[0];
    return expected !== undefined && valuesEqual(actual, expected);
  }
  return rule.values.some((candidate) => valuesEqual(actual, candidate));
}

export function firstMatchingRule(
  rules: readonly TargetingRule[],
  context: EvaluationContext,
): TargetingRule | undefined {
  return rules.find((rule) => matchesRule(rule, context));
}
