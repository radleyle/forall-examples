package dev.forall.billing.delivery;

import dev.forall.billing.domain.Invoice;
import dev.forall.billing.domain.InvoiceLine;

import java.util.List;

/** Framework-neutral transport response retaining integer-cent precision. */
public record BillingResponse(
        String subscriptionId,
        long usage,
        long subtotalCents,
        long discountCents,
        long creditCents,
        long taxCents,
        long totalCents,
        List<InvoiceLine> lines) {

    public static BillingResponse from(Invoice invoice) {
        return new BillingResponse(
                invoice.subscriptionId(),
                invoice.boundedUsage(),
                invoice.subtotalCents(),
                invoice.discountCents(),
                invoice.creditCents(),
                invoice.taxCents(),
                invoice.totalCents(),
                invoice.lines());
    }
}
