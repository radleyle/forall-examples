import type { FeatureFlag, FlagValue, TargetingRule } from "../domain/types.js";
import type { NormalizedConfiguration, RawRule } from "./types.js";

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

export type ValidationResult =
  | { readonly ok: true; readonly flags: readonly FeatureFlag[] }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

function isFlagValue(value: unknown): value is FlagValue {
  return typeof value === "boolean" || typeof value === "number" || typeof value === "string";
}

function parseRule(rule: RawRule, path: string, issues: ValidationIssue[]): TargetingRule | undefined {
  const operator = rule.operator;
  if (
    typeof rule.id !== "string" ||
    typeof rule.attribute !== "string" ||
    (operator !== "equals" && operator !== "oneOf") ||
    !Array.isArray(rule.values) ||
    !rule.values.every(isFlagValue) ||
    !isFlagValue(rule.value)
  ) {
    issues.push({ path, message: "rule must have id, attribute, operator, values, and value" });
    return undefined;
  }
  return {
    id: rule.id,
    attribute: rule.attribute,
    operator,
    values: rule.values,
    value: rule.value,
  };
}

export function validateConfiguration(config: NormalizedConfiguration): ValidationResult {
  const issues: ValidationIssue[] = [];
  const keys = new Set<string>();
  const flags: FeatureFlag[] = [];

  config.flags.forEach((flag, flagIndex) => {
    const path = `flags[${flagIndex}]`;
    if (flag.key.length === 0) issues.push({ path: `${path}.key`, message: "key is required" });
    if (keys.has(flag.key)) issues.push({ path: `${path}.key`, message: "key must be unique" });
    keys.add(flag.key);
    const rules = flag.rules
      .map((rule, ruleIndex) => parseRule(rule, `${path}.rules[${ruleIndex}]`, issues))
      .filter((rule): rule is TargetingRule => rule !== undefined);
    flags.push({ ...flag, rules });
  });

  return issues.length === 0 ? { ok: true, flags } : { ok: false, issues };
}
