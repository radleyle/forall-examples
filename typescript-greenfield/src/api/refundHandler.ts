import { quoteRefund, type RefundQuote } from "../domain/refunds.js";

export type RefundRequest = {
  paidCents: number;
  requestedCents: number;
  restockingFeeBps: number;
};

export type RefundResponse =
  | { status: 200; body: RefundQuote }
  | { status: 400; body: { error: string } };

/** Conceptual POST /refund handler; transport wiring is intentionally omitted. */
export function handleRefund(request: RefundRequest): RefundResponse {
  if (
    !Number.isInteger(request.paidCents) ||
    !Number.isInteger(request.requestedCents) ||
    !Number.isInteger(request.restockingFeeBps) ||
    request.paidCents < 0 ||
    request.requestedCents < 0 ||
    request.restockingFeeBps < 0 ||
    request.restockingFeeBps > 10_000
  ) {
    return { status: 400, body: { error: "invalid refund request" } };
  }

  return {
    status: 200,
    body: quoteRefund(
      request.paidCents,
      request.requestedCents,
      request.restockingFeeBps,
    ),
  };
}
