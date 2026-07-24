package dev.forall.billing.domain;

import java.util.List;

/** Immutable assembled invoice with explicit intermediate totals. */
public record Invoice(
        String subscriptionId,
        long boundedUsage,
        long subtotalCents,
        long discountCents,
        long creditCents,
        long taxableCents,
        long taxCents,
        long totalCents,
        List<InvoiceLine> lines) {

    public Invoice {
        if (subscriptionId == null || subscriptionId.isBlank()) {
            throw new IllegalArgumentException("subscription id is required");
        }
        if (boundedUsage < 0 || boundedUsage > BillingLimits.MAX_USAGE
                || subtotalCents < 0 || subtotalCents > BillingLimits.MAX_CENTS
                || discountCents < 0 || discountCents > subtotalCents
                || creditCents < 0 || creditCents > subtotalCents - discountCents
                || taxableCents != subtotalCents - discountCents - creditCents
                || taxCents < 0 || taxCents > BillingLimits.MAX_CENTS
                || totalCents < 0 || totalCents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("inconsistent invoice totals");
        }
        lines = List.copyOf(lines);
    }
}
