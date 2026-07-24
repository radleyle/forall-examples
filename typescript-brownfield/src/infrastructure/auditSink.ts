import type { Evaluation } from "../domain/types.js";

export interface AuditRecord {
  readonly occurredAt: string;
  readonly subjectKey: string;
  readonly evaluation: Evaluation;
}

export interface AuditSink {
  write(record: AuditRecord): Promise<void>;
}

export class InMemoryAuditSink implements AuditSink {
  readonly records: AuditRecord[] = [];

  public async write(record: AuditRecord): Promise<void> {
    this.records.push(record);
  }
}
