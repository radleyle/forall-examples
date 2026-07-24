package dev.forall.billing.application;

/** Validated input to the billing use case. */
public record BillingCommand(
        String subscriptionId,
        long reportedUsage,
        int activeDays,
        int periodDays) {

    public BillingCommand {
        if (subscriptionId == null || subscriptionId.isBlank()) {
            throw new IllegalArgumentException("subscription id is required");
        }
        if (reportedUsage < 0) {
            throw new IllegalArgumentException("usage must be non-negative");
        }
        if (periodDays <= 0 || periodDays > 366
                || activeDays < 0 || activeDays > periodDays) {
            throw new IllegalArgumentException("invalid billing period");
        }
    }
}
