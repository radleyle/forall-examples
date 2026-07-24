package dev.forall.billing.domain;

/** Shared numeric limits for billing values and rates. */
public final class BillingLimits {
    public static final long MAX_CENTS = 900_000_000_000_000L;
    public static final long MAX_USAGE = 1_000_000_000_000L;
    public static final int BASIS_POINTS = 10_000;

    private BillingLimits() {
    }
}
