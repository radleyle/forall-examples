package dev.forall.billing.domain;

/** Percentage discount with an absolute savings cap. */
public record DiscountPolicy(int basisPoints, long capCents) {
    public DiscountPolicy {
        if (basisPoints < 0 || basisPoints > BillingLimits.BASIS_POINTS) {
            throw new IllegalArgumentException("discount basis points must be 0..10000");
        }
        if (capCents < 0 || capCents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("invalid discount cap");
        }
    }

    public long amountFor(long subtotal) {
        long proposed = AdjustmentMath.percentageDiscount(subtotal, basisPoints);
        return AdjustmentMath.capDiscount(proposed, subtotal, capCents);
    }

    public static DiscountPolicy none() {
        return new DiscountPolicy(0, 0);
    }
}
