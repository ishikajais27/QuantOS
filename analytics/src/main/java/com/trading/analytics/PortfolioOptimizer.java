package com.trading.analytics;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class PortfolioOptimizer {

    /**
     * Returns the Pareto-optimal efficient frontier.
     *
     * WHY the original Graham Scan was wrong:
     * The efficient frontier of a typical portfolio set is a concave-UP curve.
     * The upper convex hull of a concave curve is just the two endpoints —
     * hence the log "Efficient frontier computed: 2 points".
     *
     * CORRECT approach: sort by risk, then keep only portfolios where
     * return is strictly increasing. This gives all Pareto-optimal points
     * (no other portfolio has both lower risk AND higher return).
     *
     * @param portfolios list of [risk, return] pairs
     * @return Pareto-optimal subset, sorted by ascending risk
     */
    public List<double[]> efficientFrontier(List<double[]> portfolios) {
        if (portfolios == null || portfolios.isEmpty()) return portfolios;

        // Sort by risk (x-axis) ascending
        List<double[]> sorted = new ArrayList<>(portfolios);
        sorted.sort((a, b) -> {
            int cmp = Double.compare(a[0], b[0]);
            return cmp != 0 ? cmp : Double.compare(a[1], b[1]);
        });

        // Keep only points where return improves — Pareto filter
        List<double[]> frontier = new ArrayList<>();
        double maxReturn = Double.NEGATIVE_INFINITY;
        for (double[] p : sorted) {
            if (p[1] > maxReturn) {
                frontier.add(p);
                maxReturn = p[1];
            }
        }
        return frontier;
    }

    // ── Union-Find for asset clustering ─────────────────────────────────────

    private int[] parent;
    private int[] rank;

    public void initUnionFind(int n) {
        parent = new int[n];
        rank   = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
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