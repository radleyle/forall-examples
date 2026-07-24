package dev.forall.billing.delivery;

import dev.forall.billing.application.BillingCommand;

/** Framework-neutral transport request. */
public record BillingRequest(
        String subscriptionId,
        long usage,
        int activeDays,
        int periodDays) {

    public BillingCommand toCommand() {
        return new BillingCommand(subscriptionId, usage, activeDays, periodDays);
    }
}
