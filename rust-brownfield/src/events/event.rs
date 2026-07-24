use crate::domain::{InventoryError, ReservationId, Sku};
use std::sync::Mutex;

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InventoryEvent {
    Reserved {
        reservation_id: ReservationId,
        sku: Sku,
        quantity: u64,
    },
    ReservationRejected {
        sku: Sku,
        quantity: u64,
        reason: InventoryError,
    },
    Released {
        reservation_id: ReservationId,
        sku: Sku,
        quantity: u64,
    },
    Expired {
        reservation_id: ReservationId,
        sku: Sku,
        quantity: u64,
    },
}

pub trait EventPublisher: Send + Sync {
    fn publish(&self, event: InventoryEvent) -> Result<(), InventoryError>;
}

pub fn publish_after_commit(
    publisher: &dyn EventPublisher,
    event: InventoryEvent,
) -> Result<(), InventoryError> {
    publisher.publish(event)
}

#[derive(Default)]
pub struct RecordingEventPublisher {
    events: Mutex<Vec<InventoryEvent>>,
}

impl RecordingEventPublisher {
    pub fn events(&self) -> Vec<InventoryEvent> {
        self.events.lock().expect("event lock poisoned").clone()
    }
}

impl EventPublisher for RecordingEventPublisher {
    fn publish(&self, event: InventoryEvent) -> Result<(), InventoryError> {
        self.events
            .lock()
            .map_err(|_| InventoryError::Repository("event lock poisoned".into()))?
            .push(event);
        Ok(())
    }
}
