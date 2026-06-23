package com.trading.analytics;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class PortfolioOptimizer {

    /**
     * Computes upper convex hull of (risk, return) points — the efficient frontier.
     * Uses Graham scan variant: sort by risk, upper hull.
     * O(n log n).
     */
    public List<double[]> efficientFrontier(List<double[]> portfolios) {
        if (portfolios == null || portfolios.size() < 2) return portfolios;
        List<double[]> sorted = new ArrayList<>(portfolios);
        sorted.sort((a, b) -> {
            int cmp = Double.compare(a[0], b[0]);
            return cmp != 0 ? cmp : Double.compare(a[1], b[1]);
        });

        List<double[]> hull = new ArrayList<>();
        for (double[] p : sorted) {
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

    /** Cross product of vectors (o→a) and (o→b) */
    private double cross(double[] o, double[] a, double[] b) {
        return (a[0] - o[0]) * (b[1] - o[1])
             - (a[1] - o[1]) * (b[0] - o[0]);
    }

    // ---- Union-Find with path compression + union by rank ----

    private int[] parent;
    private int[] rank;

    public void initUnionFind(int n) {
        parent = new int[n];
        rank   = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    public void union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        if (rank[ra] < rank[rb])      parent[ra] = rb;
        else if (rank[ra] > rank[rb]) parent[rb] = ra;
        else { parent[rb] = ra; rank[ra]++; }
    }

    public int[] clusterAssets(int n, int[][] correlatedPairs) {
        initUnionFind(n);
        for (int[] pair : correlatedPairs) union(pair[0], pair[1]);
        int[] clusters = new int[n];
        for (int i = 0; i < n; i++) clusters[i] = find(i);
        return clusters;
    }
}