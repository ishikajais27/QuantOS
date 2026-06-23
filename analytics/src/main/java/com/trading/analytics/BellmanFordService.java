package com.trading.analytics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class BellmanFordService {

    private static final Logger log = LoggerFactory.getLogger(BellmanFordService.class);

    /**
     * Detects triangular arbitrage via negative-cycle detection.
     * Nodes = assets, edge weight = -log(exchange_rate).
     * A negative cycle means product of rates > 1 → profitable arbitrage.
     */
    public List<String> detectArbitrage(Map<String, Map<String, Double>> rates) {
        List<String> assets = new ArrayList<>(rates.keySet());
        int n = assets.size();
        if (n == 0) return Collections.emptyList();

        double[] dist = new double[n];
        int[]    prev = new int[n];
        Arrays.fill(dist, 0.0);
        Arrays.fill(prev, -1);

        // Relax edges n-1 times
        for (int i = 0; i < n - 1; i++) {
            for (int u = 0; u < n; u++) {
                String from = assets.get(u);
                if (!rates.containsKey(from)) continue;
                for (Map.Entry<String, Double> edge : rates.get(from).entrySet()) {
                    int    v      = assets.indexOf(edge.getKey());
                    if (v < 0) continue;
                    double weight = -Math.log(edge.getValue());
                    if (dist[u] + weight < dist[v] - 1e-10) {
                        dist[v] = dist[u] + weight;
                        prev[v] = u;
                    }
                }
            }
        }

        // Check for further relaxation → negative cycle
        for (int u = 0; u < n; u++) {
            String from = assets.get(u);
            if (!rates.containsKey(from)) continue;
            for (Map.Entry<String, Double> edge : rates.get(from).entrySet()) {
                int    v      = assets.indexOf(edge.getKey());
                if (v < 0) continue;
                double weight = -Math.log(edge.getValue());
                if (dist[u] + weight < dist[v] - 1e-10) {
                    return traceCycle(prev, v, assets);
                }
            }
        }
        return Collections.emptyList();
    }

    private List<String> traceCycle(int[] prev, int start, List<String> assets) {
        List<String> cycle   = new ArrayList<>();
        boolean[]    visited = new boolean[assets.size()];
        int          cur     = start;
        while (cur >= 0 && !visited[cur]) {
            visited[cur] = true;
            cycle.add(assets.get(cur));
            cur = prev[cur];
        }
        if (cur >= 0) cycle.add(assets.get(cur));
        Collections.reverse(cycle);
        return cycle;
    }

    /** Build a sample rate map for demo purposes */
    public Map<String, Map<String, Double>> buildSampleRates() {
        Map<String, Map<String, Double>> rates = new LinkedHashMap<>();
        rates.put("USD", Map.of("EUR", 0.92, "GBP", 0.79, "JPY", 149.5));
        rates.put("EUR", Map.of("USD", 1.09, "GBP", 0.86, "JPY", 162.8));
        rates.put("GBP", Map.of("USD", 1.27, "EUR", 1.16, "JPY", 189.3));
        rates.put("JPY", Map.of("USD", 0.0067, "EUR", 0.0061, "GBP", 0.0053));
        return rates;
    }
}