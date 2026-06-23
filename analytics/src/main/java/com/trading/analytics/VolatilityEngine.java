package com.trading.analytics;

import org.springframework.stereotype.Service;

/**
 * Welford's online algorithm — numerically stable, O(1) per update.
 * Tracks log returns to compute realized variance and annualized volatility.
 */
@Service
public class VolatilityEngine {

    private long   count    = 0;
    private double mean     = 0.0;
    private double M2       = 0.0;
    private double lastPrice = 0.0;

    public synchronized void update(double price) {
        if (price <= 0) return;
        if (lastPrice <= 0) { lastPrice = price; return; }

        double logReturn = Math.log(price / lastPrice);
        lastPrice = price;
        count++;
        double delta  = logReturn - mean;
        mean         += delta / count;
        double delta2 = logReturn - mean;
        M2           += delta * delta2;
    }

    public synchronized double getVariance() {
        return count < 2 ? 0.0 : M2 / (count - 1);
    }

    /** Annualised volatility assuming 252 trading days */
    public synchronized double getAnnualizedVolatility() {
        return Math.sqrt(getVariance() * 252);
    }

    public synchronized long getCount() { return count; }

    public synchronized void reset() {
        count = 0; mean = 0; M2 = 0; lastPrice = 0;
    }
}