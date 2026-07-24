package dev.forall.billing.domain;

/** Pure scalar arithmetic for discounts, proration, and credits. */
public final class AdjustmentMath {
    public static final long MAX_CENTS = BillingLimits.MAX_CENTS;
    public static final int BASIS_POINTS = BillingLimits.BASIS_POINTS;

    private AdjustmentMath() {
    }

    //@ requires subtotal >= 0 && subtotal <= MAX_CENTS;
    //@ requires basisPoints >= 0 && basisPoints <= BASIS_POINTS;
    //@ requires subtotal == 0 || basisPoints <= Long.MAX_VALUE / subtotal;
    //@ ensures 0 <= \result && \result <= subtotal;
    //@ ensures \result == subtotal * basisPoints / BASIS_POINTS;
    public static long percentageDiscount(long subtotal, int basisPoints) {
        return subtotal * basisPoints / BASIS_POINTS;
    }

    //@ requires proposed >= 0;
    //@ requires subtotal >= 0;
    //@ requires discountCap >= 0;
    //@ ensures 0 <= \result && \result <= proposed;
    //@ ensures \result <= subtotal && \result <= discountCap;
    public static long capDiscount(long proposed, long subtotal, long discountCap) {
        long subtotalLimited = proposed < subtotal ? proposed : subtotal;
        return subtotalLimited < discountCap ? subtotalLimited : discountCap;
    }

    //@ requires fullAmount >= 0 && fullAmount <= MAX_CENTS;
    //@ requires totalDays > 0;
    //@ requires activeDays >= 0 && activeDays <= totalDays;
    //@ requires (\bigint) fullAmount * activeDays <= Long.MAX_VALUE;
    //@ ensures 0 <= \result && \result <= fullAmount;
    //@ ensures \result == ((\bigint) fullAmount * activeDays) / totalDays;
    public static long prorate(long fullAmount, long activeDays, long totalDays) {
        long prorated = fullAmount * activeDays / totalDays;
        if (prorated < 0 || prorated > fullAmount) {
            throw new ArithmeticException("prorated amount outside valid bounds");
        }
        return prorated;
    }

    //@ requires amountDue >= 0;
    //@ requires availableCredit >= 0;
    //@ ensures 0 <= \result && \result <= amountDue;
    //@ ensures \result <= availableCredit;
    public static long applyCredit(long amountDue, long availableCredit) {
        return amountDue < availableCredit ? amountDue : availableCredit;
    }
}
