package dev.forall.billing.domain;

/** A progressive usage band [lowerInclusive, upperExclusive). */
public record UsageTier(long lowerInclusive, long upperExclusive, long centsPerUnit) {
    public UsageTier {
        if (lowerInclusive < 0 || upperExclusive <= lowerInclusive
                || upperExclusive > BillingLimits.MAX_USAGE) {
            throw new IllegalArgumentException("invalid tier bounds");
        }
        if (centsPerUnit < 0 || centsPerUnit > BillingLimits.MAX_CENTS / upperExclusive) {
            throw new IllegalArgumentException("invalid tier rate");
        }
    }

    public long unitsFor(long boundedUsage) {
        long aboveFloor = UsageMath.tierUnits(boundedUsage, lowerInclusive);
        return UsageMath.capUnits(aboveFloor, upperExclusive - lowerInclusive);
    }

    public long chargeFor(long boundedUsage) {
        return UsageMath.safeTierCharge(unitsFor(boundedUsage), centsPerUnit);
    }
}
