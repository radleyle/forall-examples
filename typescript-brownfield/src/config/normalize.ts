import { clampPercentage } from "../domain/rollout.js";
import {
  normalizeFiniteRulePriority,
  normalizeFiniteVersion,
} from "../domain/verifiedCore.js";
import type { FlagValue } from "../domain/types.js";
import type { NormalizedConfiguration, RawConfiguration, RawFlag, RawRule } from "./types.js";

function isFlagValue(value: unknown): value is FlagValue {
  return typeof value === "boolean" || typeof value === "number" || typeof value === "string";
}

export function normalizeVersion(version: number): number {
  return Number.isFinite(version) ? normalizeFiniteVersion(version) : 1;
}

export function normalizeRulePriority(priority: number): number {
  return Number.isFinite(priority) ? normalizeFiniteRulePriority(priority) : 0;
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeFlag(value: unknown): NormalizedConfiguration["flags"][number] {
  const flag = asObject(value) as RawFlag;
  const defaultValue = isFlagValue(flag.defaultValue) ? flag.defaultValue : false;
  const rules = Array.isArray(flag.rules)
    ? flag.rules.map((rule): RawRule => ({ ...asObject(rule) }))
    : [];
  return {
    key: typeof flag.key === "string" ? flag.key.trim() : "",
    enabled: typeof flag.enabled === "boolean" ? flag.enabled : false,
    defaultValue,
    offValue: isFlagValue(flag.offValue) ? flag.offValue : defaultValue,
    rules,
    rolloutPercentage:
      typeof flag.rolloutPercentage === "number"
        ? clampPercentage(flag.rolloutPercentage)
        : 0,
    rolloutValue: isFlagValue(flag.rolloutValue) ? flag.rolloutValue : defaultValue,
  };
}

export function normalizeConfiguration(input: unknown): NormalizedConfiguration {
  const raw = asObject(input) as RawConfiguration;
  return {
    version: normalizeVersion(typeof raw.version === "number" ? raw.version : 1),
    flags: Array.isArray(raw.flags) ? raw.flags.map(normalizeFlag) : [],
  };
}
