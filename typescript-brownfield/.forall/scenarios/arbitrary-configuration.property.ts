import fc from "fast-check";
import { normalizeConfiguration } from "../../src/config/normalize.js";
import { validateConfiguration } from "../../src/config/validate.js";

export interface PropertyRunResult {
  readonly ok: boolean;
  readonly counterexample?: unknown;
  readonly seed?: number;
  readonly examplesRun?: number;
}

function settings(): { seed?: number; numRuns: number } {
  const seedText = process.env["FORALL_PBT_SEED"];
  const examplesText = process.env["FORALL_PBT_EXAMPLES"];
  const seed = seedText === undefined ? undefined : Number.parseInt(seedText, 10);
  const numRuns = examplesText === undefined ? 100 : Number.parseInt(examplesText, 10);
  return {
    ...(seed !== undefined && Number.isFinite(seed) ? { seed } : {}),
    numRuns: Number.isFinite(numRuns) && numRuns > 0 ? numRuns : 100,
  };
}

export async function runArbitraryConfigurationProperty(): Promise<PropertyRunResult> {
  const options = settings();
  try {
    await fc.assert(
      fc.asyncProperty(fc.anything(), async (input) => {
        validateConfiguration(normalizeConfiguration(input));
      }),
      options,
    );
    return {
      ok: true,
      ...(options.seed === undefined ? {} : { seed: options.seed }),
      examplesRun: options.numRuns,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      counterexample: error instanceof Error ? error.message : String(error),
      ...(options.seed === undefined ? {} : { seed: options.seed }),
      examplesRun: options.numRuns,
    };
  }
}

export default runArbitraryConfigurationProperty;
