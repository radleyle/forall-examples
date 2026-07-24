package dev.forall.billing.delivery;

import dev.forall.billing.application.BillingService;

import java.util.Objects;

/** Thin delivery adapter; an HTTP or messaging framework can call this boundary. */
public final class BillingEndpoint {
    private final BillingService billing;

    public BillingEndpoint(BillingService billing) {
        this.billing = Objects.requireNonNull(billing, "billing");
    }

    public BillingResponse createInvoice(BillingRequest request) {
        Objects.requireNonNull(request, "request");
        return BillingResponse.from(billing.bill(request.toCommand()));
    }
}
