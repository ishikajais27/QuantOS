package com.trading.analytics;

import org.springframework.stereotype.Service;

@Service
public class VolatilityEngine {

    // Welford's online algorithm — O(1) per update, numerically stable
    private long   count = 0;
    private double mean  = 0.0;
    private double M2    = 0.0; // sum of squared deviations

    public void update(double price) {
        if (price <= 0) return;
        double logReturn = Math.log(price / (mean == 0 ? price : mean));
        count++;
        double delta  = logReturn - mean;
        mean         += delta / count;
        double delta2 = logReturn - mean;
        M2           += delta * delta2;
    }

    // Realized variance
    public double getVariance() {
        return count < 2 ? 0 : M2 / (count - 1);
    }

    // Annualized volatility (252 trading days)
    public double getAnnualizedVolatility() {
        return Math.sqrt(getVariance() * 252);
    }

    public void reset() {
        count = 0;
        mean  = 0;
        M2    = 0;
    }
}