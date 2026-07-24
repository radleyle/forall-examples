package dev.forall.billing;

import dev.forall.billing.application.BillingService;
import dev.forall.billing.delivery.BillingEndpoint;
import dev.forall.billing.delivery.BillingRequest;
import dev.forall.billing.delivery.BillingResponse;
import dev.forall.billing.domain.AdjustmentMath;
import dev.forall.billing.domain.BillingLimits;
import dev.forall.billing.domain.CreditBalance;
import dev.forall.billing.domain.DiscountPolicy;
import dev.forall.billing.domain.InvoiceMath;
import dev.forall.billing.domain.InvoiceLine;
import dev.forall.billing.domain.Subscription;
import dev.forall.billing.domain.TaxMath;
import dev.forall.billing.domain.TaxPolicy;
import dev.forall.billing.domain.UsageMath;
import dev.forall.billing.domain.UsageTier;
import dev.forall.billing.repository.InMemorySubscriptionRepository;

import java.util.List;

/** Dependency-free executable acceptance harness. Run with {@code java -ea}. */
public final class BillingEngineAssertions {
    private BillingEngineAssertions() {
    }

    public static void main(String[] args) {
        scalarRulesHoldAtBoundaries();
        fullInvoiceIsAssembledAndCreditPersists();
        invalidInputsAreRejected();
        System.out.println("BillingEngineAssertions: all assertions passed");
    }

    private static void scalarRulesHoldAtBoundaries() {
        assert UsageMath.boundedUsage(BillingLimits.MAX_USAGE + 1) == BillingLimits.MAX_USAGE;
        assert UsageMath.tierUnits(250, 100) == 150;
        assert UsageMath.capUnits(150, 100) == 100;
        assert UsageMath.safeTierCharge(100, 25) == 2_500;
        assert InvoiceMath.saturatingAdd(90, 20, 100) == 100;
        assert AdjustmentMath.percentageDiscount(10_001, 2_500) == 2_500;
        assert AdjustmentMath.capDiscount(2_500, 10_001, 2_000) == 2_000;
        assert AdjustmentMath.prorate(3_100, 15, 30) == 1_550;
        assert AdjustmentMath.applyCredit(500, 900) == 500;
        assert TaxMath.taxableBase(3_300, 500, 300) == 2_500;
        assert TaxMath.taxAmount(2_500, 825) == 206;
        assert InvoiceMath.capTotal(2_706, 2_600) == 2_600;
    }

    private static void fullInvoiceIsAssembledAndCreditPersists() {
        InMemorySubscriptionRepository repository = new InMemorySubscriptionRepository();
        repository.save(new Subscription(
                "sub-100",
                3_100,
                List.of(new UsageTier(0, 100, 10), new UsageTier(100, 1_000, 5)),
                new DiscountPolicy(2_000, 500),
                new CreditBalance(300),
                new TaxPolicy(825),
                2_600));
        BillingEndpoint endpoint = new BillingEndpoint(new BillingService(repository));

        BillingResponse response = endpoint.createInvoice(
                new BillingRequest("sub-100", 250, 15, 30));

        assert response.usage() == 250;
        assert response.subtotalCents() == 3_300;
        assert response.discountCents() == 500;
        assert response.creditCents() == 300;
        assert response.taxCents() == 206;
        assert response.totalCents() == 2_600;
        assert response.lines().stream().mapToLong(InvoiceLine::signedCents).sum() == 2_600;
        assert response.lines().stream().anyMatch(line -> line.kind() == InvoiceLine.Kind.CAP);
        assert repository.findById("sub-100").orElseThrow().credit().cents() == 0;

        BillingResponse second = endpoint.createInvoice(
                new BillingRequest("sub-100", 250, 15, 30));
        assert second.creditCents() == 0;
    }

    private static void invalidInputsAreRejected() {
        expectIllegalArgument(() -> new UsageTier(100, 100, 5));
        expectIllegalArgument(() -> new DiscountPolicy(10_001, 100));
        expectIllegalArgument(() -> new BillingRequest("sub", -1, 1, 30).toCommand());
    }

    private static void expectIllegalArgument(Runnable action) {
        try {
            action.run();
            throw new AssertionError("expected IllegalArgumentException");
        } catch (IllegalArgumentException expected) {
            // Expected validation failure.
        }
    }
}
