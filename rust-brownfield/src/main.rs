use inventory_reservation::{
    InMemoryInventoryRepository, InventoryReservationService, RecordingEventPublisher, SystemClock,
};
use std::sync::Arc;

fn main() {
    let repository = Arc::new(InMemoryInventoryRepository::default());
    let publisher = Arc::new(RecordingEventPublisher::default());
    let _service = InventoryReservationService::new(repository, publisher, Arc::new(SystemClock));
    println!("inventory reservation service initialized");
}
