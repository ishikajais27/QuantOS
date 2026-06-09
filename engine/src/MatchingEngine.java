package com.trading.engine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
@RequestMapping("/engine")
public class MatchingEngine {

    private final OrderBook orderBook = new OrderBook();
    private final OrderRegistry registry = new OrderRegistry();

    public static void main(String[] args) {
        SpringApplication.run(MatchingEngine.class, args);
    }

    @PostMapping("/order")
    public String placeOrder(@RequestBody Order order) {
        order.setTimestamp(System.nanoTime());
        registry.register(order);
        orderBook.add(order);
        return matchOrders();
    }

    @DeleteMapping("/order/{id}")
    public String cancelOrder(@PathVariable String id) {
        Order order = registry.get(id);
        if (order == null) return "Order not found: " + id;
        orderBook.remove(order);
        registry.remove(id);
        return "Cancelled: " + id;
    }

    @GetMapping("/spread")
    public String getSpread() {
        return "Spread: " + orderBook.getSpread();
    }

    private String matchOrders() {
        StringBuilder result = new StringBuilder();
        // Two-pointer merge — bid top vs ask top
        while (orderBook.hasBid() && orderBook.hasAsk()) {
            Order bid = orderBook.peekBid();
            Order ask = orderBook.peekAsk();
            if (bid.getPrice() >= ask.getPrice()) {
                orderBook.pollBid();
                orderBook.pollAsk();
                registry.remove(bid.getId());
                registry.remove(ask.getId());
                result.append("Matched ").append(bid.getId())
                      .append(" <-> ").append(ask.getId())
                      .append(" @ ").append(ask.getPrice());
            } else break;
        }
        return result.length() > 0 ? result.toString() : "Order queued";
    }
}