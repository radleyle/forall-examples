import type { EvaluateFeature } from "../application/evaluateFeature.js";
import type { EvaluationContext, FlagValue } from "../domain/types.js";
import type { HttpRequest, HttpResponse } from "./types.js";

function isFlagValue(value: unknown): value is FlagValue {
  return typeof value === "boolean" || typeof value === "number" || typeof value === "string";
}

function parseBody(body: unknown): { context: EvaluationContext; fallback: FlagValue } | undefined {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return undefined;
  const input = body as Record<string, unknown>;
  if (typeof input.subjectKey !== "string" || !isFlagValue(input.fallback)) return undefined;
  const attributes =
    typeof input.attributes === "object" && input.attributes !== null && !Array.isArray(input.attributes)
      ? (input.attributes as Record<string, string | number | boolean>)
      : {};
  if (!Object.values(attributes).every(isFlagValue)) return undefined;
  return { context: { subjectKey: input.subjectKey, attributes }, fallback: input.fallback };
}

export function createEvaluateHandler(useCase: EvaluateFeature) {
  return async (request: HttpRequest): Promise<HttpResponse> => {
    const flagKey = request.params["flagKey"];
    const body = parseBody(request.body);
    if (request.method !== "POST" || flagKey === undefined || body === undefined) {
      return {
        status: 400,
        headers: { "content-type": "application/json" },
        body: { error: "invalid evaluation request" },
      };
    }
    const evaluation = await useCase.execute({ flagKey, ...body });
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: evaluation,
    };
  };
}
