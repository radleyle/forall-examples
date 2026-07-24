export interface HttpRequest {
  readonly method: string;
  readonly params: Readonly<Record<string, string | undefined>>;
  readonly body: unknown;
}

export interface HttpResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
}
