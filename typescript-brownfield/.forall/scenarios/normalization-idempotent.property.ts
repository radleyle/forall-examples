import assert from "node:assert/strict";
import fc from "fast-check";
import { normalizeFlag } from "../../src/config/normalize.js";
import type { PropertyRunResult } from "./arbitrary-configuration.property.js";

export async function runNormalizationIdempotentProperty(): Promise<PropertyRunResult> {
  const seedText = process.env["FORALL_PBT_SEED"];
  const examplesText = process.env["FORALL_PBT_EXAMPLES"];
  const seed = seedText === undefined ? undefined : Number.parseInt(seedText, 10);
  const parsedExamples = examplesText === undefined ? 100 : Number.parseInt(examplesText, 10);
  const numRuns = Number.isFinite(parsedExamples) && parsedExamples > 0 ? parsedExamples : 100;
  const options = {
    ...(seed !== undefined && Number.isFinite(seed) ? { seed } : {}),
    numRuns,
  };

  try {
    await fc.assert(
      fc.asyncProperty(fc.anything(), async (input) => {
        const once = normalizeFlag(input);
        assert.deepStrictEqual(normalizeFlag(once), once);
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

export default runNormalizationIdempotentProperty;
