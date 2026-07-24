import { evaluateFlag } from "../domain/evaluate.js";
import {
  invalidContextEvaluation,
  missingFlagEvaluation,
  repositoryErrorEvaluation,
} from "../domain/fallbacks.js";
import type { Evaluation, EvaluationContext, FlagValue } from "../domain/types.js";
import type { AuditSink } from "../infrastructure/auditSink.js";
import type { FlagRepository } from "../infrastructure/repository.js";

export interface EvaluateFeatureRequest {
  readonly flagKey: string;
  readonly fallback: FlagValue;
  readonly context: EvaluationContext;
}

export class EvaluateFeature {
  public constructor(
    private readonly repository: FlagRepository,
    private readonly audit: AuditSink,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async execute(request: EvaluateFeatureRequest): Promise<Evaluation> {
    if (request.context.subjectKey.trim().length === 0) {
      return this.record(request, invalidContextEvaluation(request.flagKey, request.fallback));
    }
    try {
      const flag = await this.repository.getByKey(request.flagKey);
      const result =
        flag === undefined
          ? missingFlagEvaluation(request.flagKey, request.fallback)
          : evaluateFlag(flag, request.context);
      return this.record(request, result);
    } catch {
      return this.record(request, repositoryErrorEvaluation(request.flagKey, request.fallback));
    }
  }

  private async record(
    request: EvaluateFeatureRequest,
    evaluation: Evaluation,
  ): Promise<Evaluation> {
    await this.audit.write({
      occurredAt: this.now().toISOString(),
      subjectKey: request.context.subjectKey,
      evaluation,
    });
    return evaluation;
  }
}
