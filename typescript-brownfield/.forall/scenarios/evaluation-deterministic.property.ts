import assert from "node:assert/strict";
import fc from "fast-check";
import { evaluateFlag } from "../../src/domain/evaluate.js";
import type { EvaluationContext, FeatureFlag } from "../../src/domain/types.js";
import type { PropertyRunResult } from "./arbitrary-configuration.property.js";

const flagValue = fc.oneof(fc.boolean(), fc.integer(), fc.string());
const contextArbitrary: fc.Arbitrary<EvaluationContext> = fc
  .record({
    subjectKey: fc.string({ minLength: 1 }),
    attributes: fc.dictionary(fc.string({ minLength: 1 }), flagValue),
  })
  .map((context) => context as EvaluationContext);

const flagArbitrary: fc.Arbitrary<FeatureFlag> = fc
  .record({
    key: fc.string({ minLength: 1 }),
    enabled: fc.boolean(),
    defaultValue: flagValue,
    offValue: flagValue,
    rolloutPercentage: fc.integer({ min: 0, max: 100 }),
    rolloutValue: flagValue,
  })
  .map((flag) => ({ ...flag, rules: [] }));

export async function runEvaluationDeterministicProperty(): Promise<PropertyRunResult> {
  const parsedSeed = Number.parseInt(process.env["FORALL_PBT_SEED"] ?? "", 10);
  const parsedExamples = Number.parseInt(process.env["FORALL_PBT_EXAMPLES"] ?? "100", 10);
  const numRuns = Number.isFinite(parsedExamples) && parsedExamples > 0 ? parsedExamples : 100;
  const options = { ...(Number.isFinite(parsedSeed) ? { seed: parsedSeed } : {}), numRuns };

  try {
    await fc.assert(
      fc.asyncProperty(flagArbitrary, contextArbitrary, async (flag, context) => {
        assert.deepStrictEqual(evaluateFlag(flag, context), evaluateFlag(flag, context));
      }),
      options,
    );
    return {
      ok: true,
      ...(options.seed === undefined ? {} : { seed: options.seed }),
      examplesRun: numRuns,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      counterexample: error instanceof Error ? error.message : String(error),
      ...(options.seed === undefined ? {} : { seed: options.seed }),
      examplesRun: numRuns,
    };
  }
}

export default runEvaluationDeterministicProperty;
