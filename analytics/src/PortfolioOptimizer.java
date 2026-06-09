package com.trading.analytics;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class PortfolioOptimizer {

    // Computes convex hull of (risk, return) points = efficient frontier
    // Uses Graham's scan O(n log n)
    public List<double[]> efficientFrontier(List<double[]> portfolios) {
        if (portfolios.size() < 3) return portfolios;

        // Sort by risk (x), then return (y)
        portfolios.sort((a, b) -> Double.compare(a[0], b[0]));

        List<double[]> hull = new ArrayList<>();
        // Upper convex hull
        for (double[] p : portfolios) {
            while (hull.size() >= 2) {
                double[] a = hull.get(hull.size() - 2);
                double[] b = hull.get(hull.size() - 1);
                if (cross(a, b, p) <= 0) hull.remove(hull.size() - 1);
                else break;
            }
            hull.add(p);
        }
        return hull;
    }

    // Cross product to determine turn direction
    private double cross(double[] o, double[] a, double[] b) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }

    // Union-Find: clusters correlated assets for hedging
    public int[] clusterAssets(int n, int[][] correlatedPairs) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int[] pair : correlatedPairs) {
            union(parent, pair[0], pair[1]);
        }
        return parent;
    }

    private int find(int[] parent, int x) {
        if (parent[x] != x) parent[x] = find(parent, parent[x]);
        return parent[x];
    }

    private void union(int[] parent, int a, int b) {
        parent[find(parent, a)] = find(parent, b);
    }
}