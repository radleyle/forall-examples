import { runArbitraryConfigurationProperty } from "../.forall/scenarios/arbitrary-configuration.property.js";
import { runEvaluationDeterministicProperty } from "../.forall/scenarios/evaluation-deterministic.property.js";
import { runNormalizationIdempotentProperty } from "../.forall/scenarios/normalization-idempotent.property.js";

const results = await Promise.all([
  runArbitraryConfigurationProperty(),
  runNormalizationIdempotentProperty(),
  runEvaluationDeterministicProperty(),
]);

const ok = results.every((result) => result.ok);
process.stdout.write(`${JSON.stringify({ ok, results }, null, 2)}\n`);
if (!ok) process.exitCode = 1;
