package dev.forall.billing.domain;

import java.util.List;
import java.util.Objects;

/** Immutable billing policy and balance for one subscription. */
public record Subscription(
        String id,
        long recurringCents,
        List<UsageTier> usageTiers,
        DiscountPolicy discount,
        CreditBalance credit,
        TaxPolicy tax,
        long invoiceCapCents) {

    public Subscription {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("subscription id is required");
        }
        if (recurringCents < 0 || recurringCents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("invalid recurring charge");
        }
        if (invoiceCapCents < 0 || invoiceCapCents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("invalid invoice cap");
        }
        usageTiers = List.copyOf(Objects.requireNonNull(usageTiers, "usageTiers"));
        discount = Objects.requireNonNull(discount, "discount");
        credit = Objects.requireNonNull(credit, "credit");
        tax = Objects.requireNonNull(tax, "tax");
        validateTiers(usageTiers);
    }

    private static void validateTiers(List<UsageTier> tiers) {
        long expectedLower = 0;
        for (UsageTier tier : tiers) {
            if (tier.lowerInclusive() != expectedLower) {
                throw new IllegalArgumentException("usage tiers must be contiguous and start at zero");
            }
            expectedLower = tier.upperExclusive();
        }
    }

    public Subscription withCredit(CreditBalance updatedCredit) {
        return new Subscription(id, recurringCents, usageTiers, discount,
                updatedCredit, tax, invoiceCapCents);
    }
}
