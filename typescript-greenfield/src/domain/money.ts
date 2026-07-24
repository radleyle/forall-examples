/** Pure money / fee helpers with Forall / LemmaScript contracts. */

/** Line total: unit price × quantity. */
export function lineTotal(unitPriceCents: number, quantity: number): number {
  //@ requires unitPriceCents >= 0
  //@ requires quantity >= 0
  //@ ensures \result >= 0
  //@ contract LineTotalNonNeg lineTotal
  return unitPriceCents * quantity;
}

/** Percent-off; return value stays in [0, priceCents]. */
export function applyPercentDiscount(priceCents: number, percentOff: number): number {
  //@ requires priceCents >= 0
  //@ requires 0 <= percentOff && percentOff <= 100
  //@ ensures 0 <= \result && \result <= priceCents
  //@ contract PercentDiscountBounds applyPercentDiscount
  return Math.floor((priceCents * (100 - percentOff)) / 100);
}

/** Fixed-amount off; return value stays in [0, priceCents]. */
export function applyFixedDiscount(priceCents: number, amountCents: number): number {
  //@ requires priceCents >= 0
  //@ requires amountCents >= 0
  //@ ensures 0 <= \result && \result <= priceCents
  //@ contract FixedDiscountBounds applyFixedDiscount
  if (amountCents >= priceCents) {
    return 0;
  }
  return priceCents - amountCents;
}

/** Cap savings so original − return ≤ capCents. */
export function applyDiscountCap(
  originalCents: number,
  discountedCents: number,
  capCents: number,
): number {
  //@ requires originalCents >= 0
  //@ requires 0 <= discountedCents && discountedCents <= originalCents
  //@ requires capCents >= 0
  //@ ensures discountedCents <= \result && \result <= originalCents
  //@ ensures originalCents - \result <= capCents
  //@ contract MaxDiscountCap applyDiscountCap
  const saved = originalCents - discountedCents;
  if (saved <= capCents) {
    return discountedCents;
  }
  return originalCents - capCents;
}

/** Tax rate is basis points (825 = 8.25%). */
export function applyTax(taxableCents: number, rateBps: number): number {
  //@ requires taxableCents >= 0
  //@ requires rateBps >= 0
  //@ ensures \result >= 0
  //@ contract TaxNonNeg applyTax
  return Math.floor((taxableCents * rateBps) / 10000);
}

/**
 * Flat shipping, waived when merchandise reaches a free-shipping threshold.
 * Result is either 0 or flatFeeCents.
 */
export function shippingFee(
  merchandiseCents: number,
  flatFeeCents: number,
  freeThresholdCents: number,
): number {
  //@ requires merchandiseCents >= 0
  //@ requires flatFeeCents >= 0
  //@ requires freeThresholdCents >= 0
  //@ ensures 0 <= \result && \result <= flatFeeCents
  //@ contract ShippingFeeBounds shippingFee
  if (merchandiseCents >= freeThresholdCents) {
    return 0;
  }
  return flatFeeCents;
}

/** Limit a requested refund to the amount originally paid. */
export function refundableAmount(paidCents: number, requestedCents: number): number {
  //@ requires paidCents >= 0
  //@ requires requestedCents >= 0
  //@ ensures 0 <= \result && \result <= paidCents
  //@ ensures \result <= requestedCents
  //@ contract RefundableAmountBounds refundableAmount
  if (requestedCents >= paidCents) {
    return paidCents;
  }
  return requestedCents;
}

/** A restocking fee expressed in basis points, capped at the refund amount. */
export function restockingFee(refundCents: number, feeBps: number): number {
  //@ requires refundCents >= 0
  //@ requires 0 <= feeBps && feeBps <= 10000
  //@ ensures 0 <= \result && \result <= refundCents
  //@ contract RestockingFeeBounds restockingFee
  return Math.floor((refundCents * feeBps) / 10000);
}
