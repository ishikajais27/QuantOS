package com.trading.engine;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class OrderRegistry {

    private final Map<String, Order> registry = new ConcurrentHashMap<>();

    public void register(Order order)     { registry.put(order.getId(), order); }
    public Order get(String id)           { return registry.get(id); }
    public void remove(String id)         { registry.remove(id); }
    public boolean exists(String id)      { return registry.containsKey(id); }
    public int size()                     { return registry.size(); }
}