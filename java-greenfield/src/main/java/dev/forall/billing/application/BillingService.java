package dev.forall.billing.application;

import dev.forall.billing.domain.AdjustmentMath;
import dev.forall.billing.domain.BillingLimits;
import dev.forall.billing.domain.Invoice;
import dev.forall.billing.domain.InvoiceLine;
import dev.forall.billing.domain.InvoiceMath;
import dev.forall.billing.domain.Subscription;
import dev.forall.billing.domain.TaxMath;
import dev.forall.billing.domain.UsageMath;
import dev.forall.billing.domain.UsageTier;
import dev.forall.billing.repository.SubscriptionRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

/** Application service that assembles and persists a complete invoice. */
public final class BillingService {
    private final SubscriptionRepository subscriptions;

    public BillingService(SubscriptionRepository subscriptions) {
        this.subscriptions = subscriptions;
    }

    public Invoice bill(BillingCommand command) {
        Subscription subscription = subscriptions.findById(command.subscriptionId())
                .orElseThrow(() -> new NoSuchElementException("unknown subscription"));
        long usage = UsageMath.boundedUsage(command.reportedUsage());
        List<InvoiceLine> lines = new ArrayList<>();

        long recurring = AdjustmentMath.prorate(
                subscription.recurringCents(), command.activeDays(), command.periodDays());
        lines.add(new InvoiceLine(InvoiceLine.Kind.RECURRING, "Recurring charge", recurring));

        long subtotal = recurring;
        for (UsageTier tier : subscription.usageTiers()) {
            long charge = tier.chargeFor(usage);
            long nextSubtotal = InvoiceMath.saturatingAdd(
                    subtotal, charge, BillingLimits.MAX_CENTS);
            long acceptedCharge = nextSubtotal - subtotal;
            if (acceptedCharge > 0) {
                lines.add(new InvoiceLine(InvoiceLine.Kind.USAGE,
                        "Usage " + tier.lowerInclusive() + "-" + tier.upperExclusive(),
                        acceptedCharge));
            }
            subtotal = nextSubtotal;
        }

        long discount = subscription.discount().amountFor(subtotal);
        if (discount > 0) {
            lines.add(new InvoiceLine(InvoiceLine.Kind.DISCOUNT, "Plan discount", -discount));
        }
        long afterDiscount = subtotal - discount;
        long credit = subscription.credit().appliedTo(afterDiscount);
        if (credit > 0) {
            lines.add(new InvoiceLine(InvoiceLine.Kind.CREDIT, "Account credit", -credit));
        }

        long taxable = TaxMath.taxableBase(subtotal, discount, credit);
        long tax = subscription.tax().taxFor(taxable);
        if (tax > 0) {
            lines.add(new InvoiceLine(InvoiceLine.Kind.TAX, "Tax", tax));
        }
        long rawTotal = taxable + tax;
        long moneyBoundedTotal = InvoiceMath.saturatingAdd(
                taxable, tax, BillingLimits.MAX_CENTS);
        long total = InvoiceMath.capTotal(moneyBoundedTotal, subscription.invoiceCapCents());
        if (moneyBoundedTotal < rawTotal) {
            lines.add(new InvoiceLine(InvoiceLine.Kind.CAP, "Money safety cap",
                    moneyBoundedTotal - rawTotal));
        }
        if (total < moneyBoundedTotal) {
            lines.add(new InvoiceLine(InvoiceLine.Kind.CAP, "Invoice cap",
                    total - moneyBoundedTotal));
        }

        subscriptions.save(subscription.withCredit(subscription.credit().consume(credit)));
        return new Invoice(subscription.id(), usage, subtotal, discount, credit,
                taxable, tax, total, lines);
    }
}
