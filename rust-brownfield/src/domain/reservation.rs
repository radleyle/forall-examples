use super::Sku;

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct ReservationId(pub String);

impl From<&str> for ReservationId {
    fn from(value: &str) -> Self {
        Self(value.to_owned())
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ReservationState {
    Active,
    Released,
    Expired,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Reservation {
    pub id: ReservationId,
    pub sku: Sku,
    pub quantity: u64,
    pub expires_at: u64,
    pub state: ReservationState,
    pub idempotency_key: String,
}

impl Reservation {
    pub fn is_active(&self) -> bool {
        self.state == ReservationState::Active
    }
}
