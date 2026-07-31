//! Narrow pure transition core.
//!
//! Standard `rustc` compiles the `cfg(not(verus_only))` implementations. Verus
//! selects the contract-bearing definitions inside `verus!` when `verus_only` is
//! set by `cargo verus`; those clauses are Verus syntax and are intentionally not
//! claimed to be accepted by standard Rust.

#[cfg(verus_only)]
use vstd::prelude::*;

#[cfg(not(verus_only))]
macro_rules! verus {
    ($($tokens:tt)*) => {};
}

verus! {
    pub fn can_reserve(available: u64, quantity: u64) -> (result: bool)
        ensures
            result == (quantity > 0 && quantity <= available),
    {
        quantity > 0 && quantity <= available
    }

    pub fn reserve_transition(
        available: u64,
        reserved: u64,
        quantity: u64,
    ) -> (result: (u64, u64))
        requires
            quantity > 0,
            quantity <= available,
            reserved <= 18446744073709551615u64 - quantity,
            available + reserved <= 18446744073709551615u64,
        ensures
            result.0 == available - quantity,
            result.1 == reserved + quantity,
            result.0 + result.1 == available + reserved,
            result.0 <= available,
    {
        (available - quantity, reserved + quantity)
    }

    pub fn rejected_transition(
        available: u64,
        reserved: u64,
        quantity: u64,
    ) -> (result: (u64, u64))
        requires
            quantity == 0 || quantity > available,
        ensures
            result.0 == available,
            result.1 == reserved,
    {
        (available, reserved)
    }

    pub fn total_stock(available: u64, reserved: u64) -> (result: u64)
        requires
            available <= 18446744073709551615u64 - reserved,
        ensures
            result == available + reserved,
            result >= available,
            result >= reserved,
    {
        available + reserved
    }

    pub fn stock_state_valid(
        available: u64,
        reserved: u64,
        capacity: u64,
    ) -> (result: bool)
        requires
            available <= 18446744073709551615u64 - reserved,
        ensures
            result == (available + reserved <= capacity),
    {
        available + reserved <= capacity
    }

    pub fn can_release(available: u64, reserved: u64, quantity: u64) -> (result: bool)
        ensures
            result == (
                quantity > 0
                && quantity <= reserved
                && available <= 18446744073709551615u64 - quantity
            ),
    {
        quantity > 0
            && quantity <= reserved
            && available <= 18446744073709551615u64 - quantity
    }

    pub fn release_transition(
        available: u64,
        reserved: u64,
        quantity: u64,
    ) -> (result: (u64, u64))
        requires
            quantity > 0,
            quantity <= reserved,
            available <= 18446744073709551615u64 - quantity,
            available + reserved <= 18446744073709551615u64,
        ensures
            result.0 == available + quantity,
            result.1 == reserved - quantity,
            result.0 + result.1 == available + reserved,
            result.0 >= available,
            result.1 <= reserved,
    {
        (available + quantity, reserved - quantity)
    }

    pub fn expiry_transition(
        available: u64,
        reserved: u64,
        quantity: u64,
    ) -> (result: (u64, u64))
        requires
            quantity > 0,
            quantity <= reserved,
            available <= 18446744073709551615u64 - quantity,
            available + reserved <= 18446744073709551615u64,
        ensures
            result.0 == available + quantity,
            result.1 == reserved - quantity,
            result.0 + result.1 == available + reserved,
    {
        (available + quantity, reserved - quantity)
    }

    pub fn is_expired(now: u64, expires_at: u64) -> (result: bool)
        ensures
            result == (now >= expires_at),
    {
        now >= expires_at
    }

    pub fn expiry_monotonic(now: u64, later: u64, expires_at: u64) -> (result: bool)
        requires
            now <= later,
        ensures
            result,
            now >= expires_at ==> later >= expires_at,
    {
        now < expires_at || later >= expires_at
    }

    pub fn checked_expiry(now: u64, ttl: u64) -> (result: u64)
        requires
            ttl > 0,
            now <= 18446744073709551615u64 - ttl,
        ensures
            result == now + ttl,
            result > now,
            result >= ttl,
    {
        now + ttl
    }
}

#[cfg(not(verus_only))]
pub fn can_reserve(available: u64, quantity: u64) -> bool {
    quantity > 0 && quantity <= available
}

#[cfg(not(verus_only))]
pub fn reserve_transition(available: u64, reserved: u64, quantity: u64) -> (u64, u64) {
    (available - quantity, reserved + quantity)
}

#[cfg(not(verus_only))]
pub fn rejected_transition(available: u64, reserved: u64, _quantity: u64) -> (u64, u64) {
    (available, reserved)
}

#[cfg(not(verus_only))]
pub fn total_stock(available: u64, reserved: u64) -> u64 {
    available + reserved
}

#[cfg(not(verus_only))]
pub fn stock_state_valid(available: u64, reserved: u64, capacity: u64) -> bool {
    available + reserved <= capacity
}

#[cfg(not(verus_only))]
pub fn can_release(available: u64, reserved: u64, quantity: u64) -> bool {
    quantity > 0 && quantity <= reserved && available.checked_add(quantity).is_some()
}

#[cfg(not(verus_only))]
pub fn release_transition(available: u64, reserved: u64, quantity: u64) -> (u64, u64) {
    (available + quantity, reserved - quantity)
}

#[cfg(not(verus_only))]
pub fn expiry_transition(available: u64, reserved: u64, quantity: u64) -> (u64, u64) {
    (available + quantity, reserved - quantity)
}

#[cfg(not(verus_only))]
pub fn is_expired(now: u64, expires_at: u64) -> bool {
    now >= expires_at
}

#[cfg(not(verus_only))]
pub fn expiry_monotonic(now: u64, later: u64, expires_at: u64) -> bool {
    now < expires_at || later >= expires_at
}

#[cfg(not(verus_only))]
pub fn checked_expiry(now: u64, ttl: u64) -> u64 {
    now + ttl
}
