package dev.forall.billing.repository;

import dev.forall.billing.domain.Subscription;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** Thread-safe in-memory adapter suitable for tests and local delivery. */
public final class InMemorySubscriptionRepository implements SubscriptionRepository {
    private final Map<String, Subscription> subscriptions = new ConcurrentHashMap<>();

    @Override
    public Optional<Subscription> findById(String id) {
        return Optional.ofNullable(subscriptions.get(id));
    }

    @Override
    public void save(Subscription subscription) {
        subscriptions.put(subscription.id(), subscription);
    }
}
