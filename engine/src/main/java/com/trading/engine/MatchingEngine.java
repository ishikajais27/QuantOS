package com.trading.engine;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/engine")
public class MatchingEngine {

    private static final Logger log = LoggerFactory.getLogger(MatchingEngine.class);

    private final OrderBook     orderBook = new OrderBook();
    private final OrderRegistry registry  = new OrderRegistry();

    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Order order) {
        if (order.getId() == null || order.getId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order id is required"));
        }
        order.setTimestamp(System.nanoTime());
        registry.register(order);
        orderBook.add(order);
        List<String> matches = matchOrders();
        log.info("Order placed: {} {} @ {} qty={}", order.getType(), order.getId(),
                order.getPrice(), order.getQuantity());
        return ResponseEntity.ok(Map.of(
                "status", "accepted",
                "orderId", order.getId(),
                "matches", matches,
                "spread", orderBook.getSpread()
        ));
    }

    @DeleteMapping("/order/{id}")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable String id) {
        Order order = registry.get(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        orderBook.remove(order);
        registry.remove(id);
        log.info("Order cancelled: {}", id);
        return ResponseEntity.ok(Map.of("status", "cancelled", "orderId", id));
    }

    @GetMapping("/spread")
    public ResponseEntity<Map<String, Object>> getSpread() {
        return ResponseEntity.ok(Map.of(
                "spread",   orderBook.getSpread(),
                "bestBid",  orderBook.getBestBid(),
                "bestAsk",  orderBook.getBestAsk(),
                "bidDepth", orderBook.bidDepth(),
                "askDepth", orderBook.askDepth()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    private List<String> matchOrders() {
        List<String> matches = new ArrayList<>();
        while (orderBook.hasBid() && orderBook.hasAsk()) {
            Order bid = orderBook.peekBid();
            Order ask = orderBook.peekAsk();
            if (bid.getPrice() >= ask.getPrice()) {
                orderBook.pollBid();
                orderBook.pollAsk();
                registry.remove(bid.getId());
                registry.remove(ask.getId());
                String match = String.format("MATCH %s <-> %s @ %.2f qty=%d",
                        bid.getId(), ask.getId(), ask.getPrice(),
                        Math.min(bid.getQuantity(), ask.getQuantity()));
                matches.add(match);
                log.info(match);
            } else {
                break;
            }
        }
        return matches;
    }
}