package dev.forall.billing.domain;

/**
 * Pure scalar arithmetic for usage bounds and tier pricing.
 * Values are integer cents or whole usage units.
 */
public final class UsageMath {
    public static final long MAX_CENTS = BillingLimits.MAX_CENTS;
    public static final long MAX_USAGE = BillingLimits.MAX_USAGE;

    private UsageMath() {
    }

    //@ requires usage >= 0;
    //@ ensures 0 <= \result && \result <= MAX_USAGE;
    //@ ensures usage <= MAX_USAGE ==> \result == usage;
    //@ ensures usage > MAX_USAGE ==> \result == MAX_USAGE;
    public static long boundedUsage(long usage) {
        return usage > MAX_USAGE ? MAX_USAGE : usage;
    }

    //@ requires totalUsage >= 0;
    //@ requires threshold >= 0;
    //@ ensures 0 <= \result && \result <= totalUsage;
    //@ ensures totalUsage <= threshold ==> \result == 0;
    //@ ensures totalUsage > threshold ==> \result == totalUsage - threshold;
    public static long tierUnits(long totalUsage, long threshold) {
        return totalUsage <= threshold ? 0 : totalUsage - threshold;
    }

    //@ requires units >= 0;
    //@ requires capacity >= 0;
    //@ ensures 0 <= \result && \result <= units;
    //@ ensures \result <= capacity;
    public static long capUnits(long units, long capacity) {
        return units < capacity ? units : capacity;
    }

    //@ requires units >= 0;
    //@ requires centsPerUnit >= 0;
    //@ requires units == 0 || centsPerUnit <= MAX_CENTS / units;
    //@ ensures 0 <= \result && \result <= MAX_CENTS;
    //@ ensures \result == units * centsPerUnit;
    public static long safeTierCharge(long units, long centsPerUnit) {
        return units * centsPerUnit;
    }
}
