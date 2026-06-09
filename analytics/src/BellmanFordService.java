package com.trading.analytics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BellmanFordService {

    // Detects triangular arbitrage via negative cycle detection
    // Nodes = assets, edges = log(exchange_rate) negated
    public List<String> detectArbitrage(Map<String, Map<String, Double>> rates) {
        List<String> assets = new ArrayList<>(rates.keySet());
        int n = assets.size();
        double[] dist = new double[n];
        int[] prev = new int[n];
        Arrays.fill(dist, 0.0);
        Arrays.fill(prev, -1);

        // Relax edges n-1 times
        for (int i = 0; i < n - 1; i++) {
            for (int u = 0; u < n; u++) {
                String from = assets.get(u);
                if (!rates.containsKey(from)) continue;
                for (Map.Entry<String, Double> edge : rates.get(from).entrySet()) {
                    int v = assets.indexOf(edge.getKey());
                    double weight = -Math.log(edge.getValue()); // negate log
                    if (dist[u] + weight < dist[v]) {
                        dist[v] = dist[u] + weight;
                        prev[v] = u;
                    }
                }
            }
        }

        // Check for negative cycle = arbitrage
        for (int u = 0; u < n; u++) {
            String from = assets.get(u);
            if (!rates.containsKey(from)) continue;
            for (Map.Entry<String, Double> edge : rates.get(from).entrySet()) {
                int v = assets.indexOf(edge.getKey());
                double weight = -Math.log(edge.getValue());
                if (dist[u] + weight < dist[v]) {
                    // Negative cycle found — trace the path
                    return traceCycle(prev, v, assets);
                }
            }
        }
        return Collections.emptyList();
    }

    private List<String> traceCycle(int[] prev, int start, List<String> assets) {
        List<String> cycle = new ArrayList<>();
        boolean[] visited = new boolean[assets.size()];
        int cur = start;
        while (!visited[cur]) {
            visited[cur] = true;
            cycle.add(assets.get(cur));
            cur = prev[cur];
        }
        cycle.add(assets.get(cur));
        return cycle;
    }

    @Scheduled(fixedDelay = 10000)
    public void runArbitrageCheck() {
        // In production: load live exchange rates and run detectArbitrage
        System.out.println("Bellman-Ford arbitrage scan running...");
    }
}