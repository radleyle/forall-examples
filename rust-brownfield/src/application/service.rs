use crate::domain::{
    verified_core, InventoryError, Reservation, ReservationId, ReservationState, Sku,
};
use crate::events::event::{publish_after_commit, EventPublisher, InventoryEvent};
use crate::repository::inventory_repository::{
    run_transaction, IdempotencyRecord, InventoryRepository,
};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

pub trait Clock: Send + Sync {
    fn now(&self) -> u64;
}

pub struct SystemClock;

impl Clock for SystemClock {
    fn now(&self) -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }
}

pub struct InventoryReservationService {
    repository: Arc<dyn InventoryRepository>,
    publisher: Arc<dyn EventPublisher>,
    clock: Arc<dyn Clock>,
    sequence: AtomicU64,
}

impl InventoryReservationService {
    pub fn new(
        repository: Arc<dyn InventoryRepository>,
        publisher: Arc<dyn EventPublisher>,
        clock: Arc<dyn Clock>,
    ) -> Self {
        Self {
            repository,
            publisher,
            clock,
            sequence: AtomicU64::new(1),
        }
    }

    pub fn reserve(
        &self,
        sku: Sku,
        quantity: u64,
        ttl: u64,
        idempotency_key: String,
    ) -> Result<Reservation, InventoryError> {
        let now = self.clock.now();
        if ttl == 0 || now.checked_add(ttl).is_none() {
            return Err(InventoryError::ArithmeticOverflow);
        }
        let expires_at = verified_core::checked_expiry(now, ttl);
        let generated_id = ReservationId(format!(
            "rsv-{}",
            self.sequence.fetch_add(1, Ordering::Relaxed)
        ));
        let mut outcome: Option<Result<Reservation, InventoryError>> = None;
        let mut replayed = false;

        run_transaction(self.repository.as_ref(), &mut |state| {
            if let Some(existing) = state.idempotency.get(&idempotency_key) {
                if existing.sku != sku || existing.quantity != quantity || existing.ttl != ttl {
                    outcome = Some(Err(InventoryError::IdempotencyConflict));
                } else {
                    replayed = true;
                    outcome = Some(match &existing.outcome {
                        Ok(id) => state
                            .reservations
                            .get(id)
                            .cloned()
                            .ok_or(InventoryError::ReservationNotFound),
                        Err(error) => Err(error.clone()),
                    });
                }
                return Ok(());
            }

            let result = match state.inventory.get_mut(&sku) {
                Some(inventory) => inventory.reserve(quantity).map(|()| {
                    let reservation = Reservation {
                        id: generated_id.clone(),
                        sku: sku.clone(),
                        quantity,
                        expires_at,
                        state: ReservationState::Active,
                        idempotency_key: idempotency_key.clone(),
                    };
                    state
                        .reservations
                        .insert(reservation.id.clone(), reservation.clone());
                    reservation
                }),
                None => Err(InventoryError::InventoryNotFound),
            };
            state.idempotency.insert(
                idempotency_key.clone(),
                IdempotencyRecord {
                    sku: sku.clone(),
                    quantity,
                    ttl,
                    outcome: result.as_ref().map(|r| r.id.clone()).map_err(Clone::clone),
                },
            );
            outcome = Some(result);
            Ok(())
        })?;

        let result = outcome.expect("transaction always assigns an outcome");
        let event = match &result {
            Ok(reservation) => InventoryEvent::Reserved {
                reservation_id: reservation.id.clone(),
                sku: sku.clone(),
                quantity,
            },
            Err(reason) => InventoryEvent::ReservationRejected {
                sku: sku.clone(),
                quantity,
                reason: reason.clone(),
            },
        };
        if !replayed {
            publish_after_commit(self.publisher.as_ref(), event)?;
        }
        result
    }

    pub fn release(&self, reservation_id: &ReservationId) -> Result<Reservation, InventoryError> {
        let mut released = None;
        run_transaction(self.repository.as_ref(), &mut |state| {
            let reservation = state
                .reservations
                .get(reservation_id)
                .cloned()
                .ok_or(InventoryError::ReservationNotFound)?;
            if !reservation.is_active() {
                return Err(InventoryError::ReservationNotActive);
            }
            state
                .inventory
                .get_mut(&reservation.sku)
                .ok_or(InventoryError::InventoryNotFound)?
                .release(reservation.quantity)?;
            let updated = state
                .reservations
                .get_mut(reservation_id)
                .ok_or(InventoryError::ReservationNotFound)?;
            updated.state = ReservationState::Released;
            released = Some(updated.clone());
            Ok(())
        })?;
        let released = released.expect("successful transaction releases a reservation");
        publish_after_commit(
            self.publisher.as_ref(),
            InventoryEvent::Released {
                reservation_id: released.id.clone(),
                sku: released.sku.clone(),
                quantity: released.quantity,
            },
        )?;
        Ok(released)
    }

    pub fn expire_due(&self) -> Result<Vec<Reservation>, InventoryError> {
        let now = self.clock.now();
        let mut expired = Vec::new();
        run_transaction(self.repository.as_ref(), &mut |state| {
            let due: Vec<_> = state
                .reservations
                .values()
                .filter(|r| r.is_active() && verified_core::is_expired(now, r.expires_at))
                .map(|r| r.id.clone())
                .collect();
            for id in due {
                let reservation = state.reservations[&id].clone();
                state
                    .inventory
                    .get_mut(&reservation.sku)
                    .ok_or(InventoryError::InventoryNotFound)?
                    .expire(reservation.quantity)?;
                let updated = state.reservations.get_mut(&id).unwrap();
                updated.state = ReservationState::Expired;
                expired.push(updated.clone());
            }
            Ok(())
        })?;
        for reservation in &expired {
            publish_after_commit(
                self.publisher.as_ref(),
                InventoryEvent::Expired {
                    reservation_id: reservation.id.clone(),
                    sku: reservation.sku.clone(),
                    quantity: reservation.quantity,
                },
            )?;
        }
        Ok(expired)
    }
}
