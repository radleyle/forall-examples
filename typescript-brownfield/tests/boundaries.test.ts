import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEvaluateHandler } from "../src/api/evaluateHandler.js";
import { EvaluateFeature } from "../src/application/evaluateFeature.js";
import { InMemoryAuditSink } from "../src/infrastructure/auditSink.js";
import { InMemoryFlagRepository } from "../src/infrastructure/inMemoryFlagRepository.js";

describe("evaluation boundaries", () => {
  it("returns and audits the caller fallback for a missing flag", async () => {
    const audit = new InMemoryAuditSink();
    const service = new EvaluateFeature(
      new InMemoryFlagRepository(),
      audit,
      () => new Date("2026-01-01T00:00:00.000Z"),
    );
    const result = await service.execute({
      flagKey: "missing",
      fallback: "safe",
      context: { subjectKey: "subject", attributes: {} },
    });
    assert.equal(result.reason, "FLAG_NOT_FOUND");
    assert.equal(result.value, "safe");
    assert.equal(audit.records.length, 1);
  });

  it("rejects malformed HTTP requests", async () => {
    const handler = createEvaluateHandler(
      new EvaluateFeature(new InMemoryFlagRepository(), new InMemoryAuditSink()),
    );
    const response = await handler({ method: "GET", params: {}, body: null });
    assert.equal(response.status, 400);
  });
});
