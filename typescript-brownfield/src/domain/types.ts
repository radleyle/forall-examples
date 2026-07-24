export type FlagValue = boolean | number | string;

export interface EvaluationContext {
  readonly subjectKey: string;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}

export interface TargetingRule {
  readonly id: string;
  readonly attribute: string;
  readonly operator: "equals" | "oneOf";
  readonly values: readonly FlagValue[];
  readonly value: FlagValue;
}

export interface FeatureFlag {
  readonly key: string;
  readonly enabled: boolean;
  readonly defaultValue: FlagValue;
  readonly offValue: FlagValue;
  readonly rules: readonly TargetingRule[];
  readonly rolloutPercentage: number;
  readonly rolloutValue: FlagValue;
}

export type EvaluationReason =
  | "FLAG_DISABLED"
  | "TARGETING_MATCH"
  | "ROLLOUT_MATCH"
  | "ROLLOUT_MISS"
  | "FLAG_NOT_FOUND"
  | "INVALID_CONTEXT"
  | "REPOSITORY_ERROR";

export interface Evaluation {
  readonly flagKey: string;
  readonly value: FlagValue;
  readonly reason: EvaluationReason;
  readonly ruleId?: string;
  readonly bucket?: number;
}
