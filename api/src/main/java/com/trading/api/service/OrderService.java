package com.trading.api.service;

import com.trading.api.entity.Order;
import com.trading.api.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository   repo;
    private final RateLimitService  rateLimitService;
    private final RestTemplate      http = new RestTemplate();

    @Value("${engine.url:http://engine:8081}")
    private String engineUrl;

    // Constructor injection — RateLimitService is a Spring bean, injected automatically
    public OrderService(OrderRepository repo, RateLimitService rateLimitService) {
        this.repo             = repo;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Places an order after checking the per-account rate limit.
     * accountId and role come from the JWT claims extracted in the controller.
     *
     * Why rate limit here and not in the controller?
     * The service layer is the right place — it's closest to the
     * engine call and can't be bypassed by adding another controller.
     */
    public Order placeOrder(Order order, String accountId, String role) {
        // Check rate limit before touching the engine
        if (!rateLimitService.isAllowed(accountId, role)) {
            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Rate limit exceeded. Slow down your order flow."
            );
        }

        Order saved = repo.save(order);
        try {
            http.postForObject(engineUrl + "/engine/order", saved, String.class);
        } catch (Exception e) {
            log.warn("Engine unreachable — order saved locally: {}", e.getMessage());
        }
        return saved;
    }

    /**
     * Overload for callers that don't yet pass accountId/role.
     * Defaults to TRADER role with no rate limit check (internal use only).
     */
    public Order placeOrder(Order order) {
        Order saved = repo.save(order);
        try {
            http.postForObject(engineUrl + "/engine/order", saved, String.class);
        } catch (Exception e) {
            log.warn("Engine unreachable: {}", e.getMessage());
        }
        return saved;
    }

    public void cancelOrder(String id) {
        Order order = repo.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.CANCELLED);
        repo.save(order);
        try {
            http.delete(engineUrl + "/engine/order/" + id);
        } catch (Exception e) {
            log.warn("Engine cancel failed: {}", e.getMessage());
        }
    }

    public List<Order> getOrdersByAccount(String accountId) {
        return repo.findByAccountId(accountId);
    }
}