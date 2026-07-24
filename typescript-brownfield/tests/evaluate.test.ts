import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFlag } from "../src/domain/evaluate.js";
import type { FeatureFlag } from "../src/domain/types.js";

const flag: FeatureFlag = {
  key: "new-checkout",
  enabled: true,
  defaultValue: false,
  offValue: false,
  rolloutPercentage: 0,
  rolloutValue: true,
  rules: [
    {
      id: "internal-users",
      attribute: "plan",
      operator: "equals",
      values: ["internal"],
      value: true,
    },
  ],
};

describe("evaluateFlag", () => {
  it("returns a targeting value and audit reason", () => {
    assert.deepStrictEqual(
      evaluateFlag(flag, { subjectKey: "user-1", attributes: { plan: "internal" } }),
      {
        flagKey: "new-checkout",
        value: true,
        reason: "TARGETING_MATCH",
        ruleId: "internal-users",
      },
    );
  });

  it("uses the default when rollout misses", () => {
    const result = evaluateFlag(flag, { subjectKey: "user-2", attributes: {} });
    assert.equal(result.value, false);
    assert.equal(result.reason, "ROLLOUT_MISS");
    assert.equal(typeof result.bucket, "number");
  });
});
