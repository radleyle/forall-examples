package dev.forall.billing.domain;

/** Immutable account credit balance in cents. */
public record CreditBalance(long cents) {
    public CreditBalance {
        if (cents < 0 || cents > BillingLimits.MAX_CENTS) {
            throw new IllegalArgumentException("invalid credit balance");
        }
    }

    public long appliedTo(long amountDue) {
        return AdjustmentMath.applyCredit(amountDue, cents);
    }

    public CreditBalance consume(long appliedCents) {
        if (appliedCents < 0 || appliedCents > cents) {
            throw new IllegalArgumentException("invalid credit consumption");
        }
        return new CreditBalance(cents - appliedCents);
    }
}
