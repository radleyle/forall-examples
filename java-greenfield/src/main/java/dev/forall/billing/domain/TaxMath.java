package dev.forall.billing.domain;

/** Pure scalar arithmetic for taxable amounts and tax rates. */
public final class TaxMath {
    public static final long MAX_CENTS = BillingLimits.MAX_CENTS;
    public static final int BASIS_POINTS = BillingLimits.BASIS_POINTS;

    private TaxMath() {
    }

    //@ requires subtotal >= 0;
    //@ requires discount >= 0 && discount <= subtotal;
    //@ requires credit >= 0 && credit <= subtotal - discount;
    //@ ensures 0 <= \result && \result <= subtotal;
    //@ ensures \result == subtotal - discount - credit;
    public static long taxableBase(long subtotal, long discount, long credit) {
        return subtotal - discount - credit;
    }

    //@ requires taxableCents >= 0 && taxableCents <= MAX_CENTS;
    //@ requires basisPoints >= 0 && basisPoints <= BASIS_POINTS;
    //@ requires taxableCents == 0 || basisPoints <= Long.MAX_VALUE / taxableCents;
    //@ ensures 0 <= \result && \result <= taxableCents;
    //@ ensures \result == taxableCents * basisPoints / BASIS_POINTS;
    public static long taxAmount(long taxableCents, int basisPoints) {
        return taxableCents * basisPoints / BASIS_POINTS;
    }
}
