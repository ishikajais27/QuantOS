package com.trading.api.controller;

import com.trading.api.entity.Order;
import com.trading.api.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Place an order.
     *
     * The accountId is always overridden with the JWT principal when a valid
     * token is present — this prevents account spoofing.  When no token is
     * present the body's accountId is used, and the server validates it is
     * non-blank before attempting a DB write (avoiding the 500 caused by
     * a NOT-NULL constraint violation on a null accountId).
     *
     * price/quantity validation here prevents the second class of 500s:
     * JSON.stringify(NaN) produces null, which also violates NOT-NULL.
     */
    @PostMapping
    public ResponseEntity<?> place(@RequestBody Order order, Authentication auth) {

        // Override accountId with the authenticated principal
        if (auth != null && auth.getName() != null) {
            order.setAccountId(auth.getName());
        }

        // Server-side validation — return 400 instead of letting the DB throw 500
        if (order.getAccountId() == null || order.getAccountId().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Not authenticated — please log in before placing orders."));
        }
        if (order.getInstrumentId() == null || order.getInstrumentId().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "instrumentId is required."));
        }
        if (order.getType() == null ||
                (!order.getType().equalsIgnoreCase("BID") &&
                 !order.getType().equalsIgnoreCase("ASK"))) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "type must be BID or ASK."));
        }
        if (order.getPrice() == null || order.getPrice() <= 0) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "price must be a positive number."));
        }
        if (order.getQuantity() == null || order.getQuantity() <= 0) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "quantity must be a positive integer."));
        }

        return ResponseEntity.ok(orderService.placeOrder(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Order>> getByAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(orderService.getOrdersByAccount(accountId));
    }
}