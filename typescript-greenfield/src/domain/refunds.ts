import { refundableAmount, restockingFee } from "./money.js";

export type RefundQuote = {
  grossRefundCents: number;
  restockingFeeCents: number;
  netRefundCents: number;
};

/**
 * Build the customer-facing refund amounts from a captured payment and request.
 * The pure bounds-critical arithmetic remains in money.ts.
 */
export function quoteRefund(
  paidCents: number,
  requestedCents: number,
  restockingFeeBps: number,
): RefundQuote {
  const grossRefundCents = refundableAmount(paidCents, requestedCents);
  const restockingFeeCents = restockingFee(grossRefundCents, restockingFeeBps);

  return {
    grossRefundCents,
    restockingFeeCents,
    netRefundCents: grossRefundCents - restockingFeeCents,
  };
}
