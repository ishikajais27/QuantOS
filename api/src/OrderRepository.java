package com.trading.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByAccountId(String accountId);
    List<Order> findByInstrumentIdAndStatus(String instrumentId, Order.OrderStatus status);
}