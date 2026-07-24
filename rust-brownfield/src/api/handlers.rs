use crate::application::service::InventoryReservationService;
use crate::domain::{InventoryError, Reservation, ReservationId, Sku};

pub struct ReserveRequest {
    pub sku: String,
    pub quantity: u64,
    pub ttl_seconds: u64,
    pub idempotency_key: String,
}

pub struct ApiResponse<T> {
    pub status: u16,
    pub body: Result<T, String>,
}

pub fn reserve_handler(
    service: &InventoryReservationService,
    request: ReserveRequest,
) -> ApiResponse<Reservation> {
    respond(service.reserve(
        Sku(request.sku),
        request.quantity,
        request.ttl_seconds,
        request.idempotency_key,
    ))
}

pub fn release_handler(
    service: &InventoryReservationService,
    reservation_id: String,
) -> ApiResponse<Reservation> {
    respond(service.release(&ReservationId(reservation_id)))
}

pub fn expire_handler(service: &InventoryReservationService) -> ApiResponse<Vec<Reservation>> {
    respond(service.expire_due())
}

fn respond<T>(result: Result<T, InventoryError>) -> ApiResponse<T> {
    match result {
        Ok(value) => ApiResponse {
            status: 200,
            body: Ok(value),
        },
        Err(error) => {
            let status = match error {
                InventoryError::InventoryNotFound | InventoryError::ReservationNotFound => 404,
                InventoryError::InsufficientStock
                | InventoryError::InvalidQuantity
                | InventoryError::ReservationNotActive
                | InventoryError::IdempotencyConflict => 409,
                InventoryError::ArithmeticOverflow | InventoryError::Repository(_) => 500,
            };
            ApiResponse {
                status,
                body: Err(error.to_string()),
            }
        }
    }
}
