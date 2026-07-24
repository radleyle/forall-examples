import type { FlagValue } from "../domain/types.js";

export interface RawRule {
  readonly id?: unknown;
  readonly attribute?: unknown;
  readonly operator?: unknown;
  readonly values?: unknown;
  readonly value?: unknown;
}

export interface RawFlag {
  readonly key?: unknown;
  readonly enabled?: unknown;
  readonly defaultValue?: unknown;
  readonly offValue?: unknown;
  readonly rules?: unknown;
  readonly rolloutPercentage?: unknown;
  readonly rolloutValue?: unknown;
}

export interface RawConfiguration {
  readonly version?: unknown;
  readonly flags?: unknown;
}

export interface NormalizedConfiguration {
  readonly version: number;
  readonly flags: readonly {
    readonly key: string;
    readonly enabled: boolean;
    readonly defaultValue: FlagValue;
    readonly offValue: FlagValue;
    readonly rules: readonly RawRule[];
    readonly rolloutPercentage: number;
    readonly rolloutValue: FlagValue;
  }[];
}
