package com.trading.api.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.trading.api.entity.Order;
import com.trading.api.repository.OrderRepository;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository repo;
    private final RestTemplate    http = new RestTemplate();

    @Value("${engine.url:http://engine:8081}")
    private String engineUrl;

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }

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