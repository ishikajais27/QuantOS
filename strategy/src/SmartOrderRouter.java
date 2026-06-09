package com.trading.strategy;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

import org.springframework.stereotype.Component;

// Dijkstra over venue graph for minimum-cost order routing
@Component
public class SmartOrderRouter {

    record Venue(String name, double fee, double liquidity) {}
    record Edge(String to, double cost) {}

    private final Map<String, List<Edge>> graph = new HashMap<>();

    public SmartOrderRouter() {
        // Venue graph: NSE, BSE, DARK_POOL connected by routing paths
        graph.put("NSE",       List.of(new Edge("BSE", 0.02), new Edge("DARK_POOL", 0.005)));
        graph.put("BSE",       List.of(new Edge("NSE", 0.02)));
        graph.put("DARK_POOL", List.of(new Edge("NSE", 0.01)));
    }

    // Returns optimal venue sequence using Dijkstra
    public List<String> route(String from, String to, long quantity) {
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        PriorityQueue<String> pq = new PriorityQueue<>(
            Comparator.comparingDouble(v -> dist.getOrDefault(v, Double.MAX_VALUE))
        );

        for (String v : graph.keySet()) dist.put(v, Double.MAX_VALUE);
        dist.put(from, 0.0);
        pq.add(from);

        while (!pq.isEmpty()) {
            String cur = pq.poll();
            for (Edge edge : graph.getOrDefault(cur, List.of())) {
                double newDist = dist.get(cur) + edge.cost();
                if (newDist < dist.getOrDefault(edge.to(), Double.MAX_VALUE)) {
                    dist.put(edge.to(), newDist);
                    prev.put(edge.to(), cur);
                    pq.add(edge.to());
                }
            }
        }

        List<String> path = new ArrayList<>();
        for (String v = to; v != null; v = prev.get(v)) path.add(0, v);
        return path;
    }
}