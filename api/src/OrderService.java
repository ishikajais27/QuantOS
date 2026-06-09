package com.trading.api;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String engineUrl = "http://localhost:8081/engine/order";

    public OrderService(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    public Order placeOrder(Order order) {
        Order saved = orderRepo.save(order);
        // Forward to matching engine
        try {
            restTemplate.postForObject(engineUrl, saved, String.class);
        } catch (Exception e) {
            System.err.println("Engine unavailable: " + e.getMessage());
        }
        return saved;
    }

    public void cancelOrder(String id) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepo.save(order);
        restTemplate.delete("http://localhost:8081/engine/order/" + id);
    }

    public List<Order> getOrdersByAccount(String accountId) {
        return orderRepo.findByAccountId(accountId);
    }
}