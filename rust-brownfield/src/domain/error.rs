use std::fmt::{Display, Formatter};

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InventoryError {
    InvalidQuantity,
    InsufficientStock,
    InventoryNotFound,
    ReservationNotFound,
    ReservationNotActive,
    IdempotencyConflict,
    ArithmeticOverflow,
    Repository(String),
}

impl Display for InventoryError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self:?}")
    }
}

impl std::error::Error for InventoryError {}
