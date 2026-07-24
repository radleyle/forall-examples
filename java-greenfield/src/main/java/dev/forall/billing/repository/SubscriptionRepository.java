package dev.forall.billing.repository;

import dev.forall.billing.domain.Subscription;

import java.util.Optional;

/** Persistence port owned by the application boundary. */
public interface SubscriptionRepository {
    Optional<Subscription> findById(String id);

    void save(Subscription subscription);
}
