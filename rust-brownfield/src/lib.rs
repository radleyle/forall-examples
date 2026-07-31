// Verus turns on `verus_only` during `cargo verus verify`. Keep this import gated so
// ordinary `cargo check` / `cargo test` do not require Verus syntax elsewhere.
#[cfg(verus_only)]
use vstd::prelude::*;

pub mod api;
pub mod application;
pub mod domain;
pub mod events;
pub mod repository;

pub use application::service::{Clock, InventoryReservationService, SystemClock};
pub use events::event::{InventoryEvent, RecordingEventPublisher};
pub use repository::inventory_repository::{InMemoryInventoryRepository, InventoryRepository};
