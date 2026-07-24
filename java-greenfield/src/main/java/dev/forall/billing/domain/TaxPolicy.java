package dev.forall.billing.domain;

/** Tax policy represented in basis points. */
public record TaxPolicy(int basisPoints) {
    public TaxPolicy {
        if (basisPoints < 0 || basisPoints > BillingLimits.BASIS_POINTS) {
            throw new IllegalArgumentException("tax basis points must be 0..10000");
        }
    }

    public long taxFor(long taxableCents) {
        return TaxMath.taxAmount(taxableCents, basisPoints);
    }
}
