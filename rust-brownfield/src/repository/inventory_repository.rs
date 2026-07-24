use crate::domain::{Inventory, InventoryError, Reservation, ReservationId, Sku};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct IdempotencyRecord {
    pub sku: Sku,
    pub quantity: u64,
    pub ttl: u64,
    pub outcome: Result<ReservationId, InventoryError>,
}

#[derive(Default)]
pub struct RepositoryState {
    pub inventory: HashMap<Sku, Inventory>,
    pub reservations: HashMap<ReservationId, Reservation>,
    pub idempotency: HashMap<String, IdempotencyRecord>,
}

pub trait InventoryRepository: Send + Sync {
    fn transaction(
        &self,
        operation: &mut dyn FnMut(&mut RepositoryState) -> Result<(), InventoryError>,
    ) -> Result<(), InventoryError>;
}

pub fn run_transaction(
    repository: &dyn InventoryRepository,
    operation: &mut dyn FnMut(&mut RepositoryState) -> Result<(), InventoryError>,
) -> Result<(), InventoryError> {
    repository.transaction(operation)
}

#[derive(Default)]
pub struct InMemoryInventoryRepository {
    state: Mutex<RepositoryState>,
}

impl InMemoryInventoryRepository {
    pub fn seed(&self, inventory: Inventory) -> Result<(), InventoryError> {
        self.transaction(&mut |state| {
            state
                .inventory
                .insert(inventory.sku.clone(), inventory.clone());
            Ok(())
        })
    }

    pub fn snapshot(&self) -> Result<(Vec<Inventory>, Vec<Reservation>), InventoryError> {
        let state = self
            .state
            .lock()
            .map_err(|_| InventoryError::Repository("inventory lock poisoned".into()))?;
        Ok((
            state.inventory.values().cloned().collect(),
            state.reservations.values().cloned().collect(),
        ))
    }
}

impl InventoryRepository for InMemoryInventoryRepository {
    fn transaction(
        &self,
        operation: &mut dyn FnMut(&mut RepositoryState) -> Result<(), InventoryError>,
    ) -> Result<(), InventoryError> {
        let mut state = self
            .state
            .lock()
            .map_err(|_| InventoryError::Repository("inventory lock poisoned".into()))?;
        operation(&mut state)
    }
}
