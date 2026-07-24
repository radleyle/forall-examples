package dev.forall.billing.domain;

/** Pure scalar arithmetic for bounded invoice aggregation. */
public final class InvoiceMath {
    public static final long MAX_CENTS = BillingLimits.MAX_CENTS;

    private InvoiceMath() {
    }

    //@ requires left >= 0 && left <= cap;
    //@ requires right >= 0 && right <= cap;
    //@ requires cap >= 0 && cap <= MAX_CENTS;
    //@ ensures 0 <= \result && \result <= cap;
    //@ ensures left > cap - right ==> \result == cap;
    //@ ensures left <= cap - right ==> \result == left + right;
    public static long saturatingAdd(long left, long right, long cap) {
        return left > cap - right ? cap : left + right;
    }

    //@ requires amount >= 0;
    //@ requires accountCap >= 0;
    //@ ensures 0 <= \result && \result <= amount;
    //@ ensures \result <= accountCap;
    public static long capTotal(long amount, long accountCap) {
        return amount < accountCap ? amount : accountCap;
    }
}
