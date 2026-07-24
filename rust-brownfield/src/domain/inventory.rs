use super::{verified_core, InventoryError};

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct Sku(pub String);

impl From<&str> for Sku {
    fn from(value: &str) -> Self {
        Self(value.to_owned())
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Inventory {
    pub sku: Sku,
    pub available: u64,
    pub reserved: u64,
}

impl Inventory {
    pub fn new(sku: Sku, available: u64) -> Self {
        Self {
            sku,
            available,
            reserved: 0,
        }
    }

    pub fn reserve(&mut self, quantity: u64) -> Result<(), InventoryError> {
        if !verified_core::can_reserve(self.available, quantity) {
            let _unchanged =
                verified_core::rejected_transition(self.available, self.reserved, quantity);
            return Err(if quantity == 0 {
                InventoryError::InvalidQuantity
            } else {
                InventoryError::InsufficientStock
            });
        }
        if self.reserved.checked_add(quantity).is_none() {
            return Err(InventoryError::ArithmeticOverflow);
        }
        let (available, reserved) =
            verified_core::reserve_transition(self.available, self.reserved, quantity);
        self.available = available;
        self.reserved = reserved;
        Ok(())
    }

    pub fn release(&mut self, quantity: u64) -> Result<(), InventoryError> {
        if !verified_core::can_release(self.available, self.reserved, quantity) {
            return Err(if quantity == 0 || quantity > self.reserved {
                InventoryError::InvalidQuantity
            } else {
                InventoryError::ArithmeticOverflow
            });
        }
        let (available, reserved) =
            verified_core::release_transition(self.available, self.reserved, quantity);
        self.available = available;
        self.reserved = reserved;
        Ok(())
    }

    pub fn expire(&mut self, quantity: u64) -> Result<(), InventoryError> {
        if !verified_core::can_release(self.available, self.reserved, quantity) {
            return Err(if quantity == 0 || quantity > self.reserved {
                InventoryError::InvalidQuantity
            } else {
                InventoryError::ArithmeticOverflow
            });
        }
        let (available, reserved) =
            verified_core::expiry_transition(self.available, self.reserved, quantity);
        self.available = available;
        self.reserved = reserved;
        Ok(())
    }
}
