package dev.forall.billing.domain;

import java.util.Objects;

/** One auditable invoice component; adjustments use negative signed cents. */
public record InvoiceLine(Kind kind, String description, long signedCents) {
    public enum Kind {
        RECURRING, USAGE, DISCOUNT, CREDIT, TAX, CAP
    }

    public InvoiceLine {
        Objects.requireNonNull(kind, "kind");
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("description is required");
        }
        if (signedCents < -BillingLimits.MAX_CENTS || signedCents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("line amount exceeds money bounds");
        }
    }
}
