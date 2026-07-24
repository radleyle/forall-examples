use inventory_reservation::domain::{
    verified_core, Inventory, InventoryError, ReservationState, Sku,
};
use inventory_reservation::{
    Clock, InMemoryInventoryRepository, InventoryRepository, InventoryReservationService,
    RecordingEventPublisher,
};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

struct TestClock(AtomicU64);

impl TestClock {
    fn new(now: u64) -> Self {
        Self(AtomicU64::new(now))
    }

    fn set(&self, now: u64) {
        self.0.store(now, Ordering::Relaxed);
    }
}

impl Clock for TestClock {
    fn now(&self) -> u64 {
        self.0.load(Ordering::Relaxed)
    }
}

fn fixture(
    available: u64,
) -> (
    Arc<InMemoryInventoryRepository>,
    Arc<RecordingEventPublisher>,
    Arc<TestClock>,
    InventoryReservationService,
) {
    let repository = Arc::new(InMemoryInventoryRepository::default());
    repository
        .seed(Inventory::new(Sku::from("widget"), available))
        .unwrap();
    let publisher = Arc::new(RecordingEventPublisher::default());
    let clock = Arc::new(TestClock::new(100));
    let service = InventoryReservationService::new(
        repository.clone() as Arc<dyn InventoryRepository>,
        publisher.clone(),
        clock.clone(),
    );
    (repository, publisher, clock, service)
}

#[test]
fn reserve_is_idempotent_and_conserves_stock() {
    let (repository, publisher, _, service) = fixture(10);
    let first = service
        .reserve(Sku::from("widget"), 4, 30, "order-1".into())
        .unwrap();
    let replay = service
        .reserve(Sku::from("widget"), 4, 30, "order-1".into())
        .unwrap();

    assert_eq!(first.id, replay.id);
    let (inventory, reservations) = repository.snapshot().unwrap();
    assert_eq!((inventory[0].available, inventory[0].reserved), (6, 4));
    assert_eq!(reservations.len(), 1);
    assert_eq!(publisher.events().len(), 1);
}

#[test]
fn idempotency_key_rejects_conflicting_input() {
    let (repository, publisher, _, service) = fixture(10);
    service
        .reserve(Sku::from("widget"), 4, 30, "order-conflict".into())
        .unwrap();

    assert_eq!(
        service
            .reserve(Sku::from("widget"), 5, 30, "order-conflict".into())
            .unwrap_err(),
        InventoryError::IdempotencyConflict
    );
    let (inventory, reservations) = repository.snapshot().unwrap();
    assert_eq!((inventory[0].available, inventory[0].reserved), (6, 4));
    assert_eq!(reservations.len(), 1);
    assert_eq!(publisher.events().len(), 2);
}

#[test]
fn rejected_reservation_leaves_inventory_unchanged() {
    let (repository, _, _, service) = fixture(3);
    let result = service.reserve(Sku::from("widget"), 4, 30, "order-2".into());

    assert_eq!(result.unwrap_err(), InventoryError::InsufficientStock);
    let (inventory, reservations) = repository.snapshot().unwrap();
    assert_eq!((inventory[0].available, inventory[0].reserved), (3, 0));
    assert!(reservations.is_empty());
}

#[test]
fn release_restores_stock_and_cannot_repeat() {
    let (repository, _, _, service) = fixture(10);
    let reservation = service
        .reserve(Sku::from("widget"), 4, 30, "order-3".into())
        .unwrap();

    let released = service.release(&reservation.id).unwrap();
    assert_eq!(released.state, ReservationState::Released);
    assert_eq!(
        service.release(&reservation.id).unwrap_err(),
        InventoryError::ReservationNotActive
    );
    let (inventory, _) = repository.snapshot().unwrap();
    assert_eq!((inventory[0].available, inventory[0].reserved), (10, 0));
}

#[test]
fn only_due_active_reservations_expire() {
    let (repository, _, clock, service) = fixture(10);
    service
        .reserve(Sku::from("widget"), 2, 10, "order-4".into())
        .unwrap();
    service
        .reserve(Sku::from("widget"), 3, 20, "order-5".into())
        .unwrap();

    clock.set(111);
    let expired = service.expire_due().unwrap();
    assert_eq!(expired.len(), 1);
    assert_eq!(expired[0].state, ReservationState::Expired);
    let (inventory, _) = repository.snapshot().unwrap();
    assert_eq!((inventory[0].available, inventory[0].reserved), (7, 3));
    assert!(service.expire_due().unwrap().is_empty());
}

#[test]
fn expiry_remains_true_as_time_advances() {
    assert!(verified_core::expiry_monotonic(110, 120, 105));
    assert!(verified_core::expiry_monotonic(100, 120, 105));
}

#[test]
fn total_stock_and_capacity_helpers_capture_invariants() {
    assert_eq!(verified_core::total_stock(7, 3), 10);
    assert!(verified_core::stock_state_valid(7, 3, 10));
    assert!(!verified_core::stock_state_valid(7, 3, 9));
    assert!(verified_core::can_release(7, 3, 2));
    assert!(!verified_core::can_release(7, 3, 4));
}
