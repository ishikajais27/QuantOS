package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.Deque;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service  // ← this is what allows Spring to inject it into AnalyticsScheduler
public class AnomalyDetector {

    private static final Logger log = LoggerFactory.getLogger(AnomalyDetector.class);

    private static final int    WINDOW_SIZE = 60;
    private static final double Z_THRESHOLD = 2.5;

    private final Deque<Double> window = new ArrayDeque<>();
    private double sumX   = 0.0;
    private double sumXSq = 0.0;

    public AnomalyResult detect(double price) {
        if (window.size() == WINDOW_SIZE) {
            double evicted = window.pollFirst();
            sumX   -= evicted;
            sumXSq -= evicted * evicted;
        }
        window.addLast(price);
        sumX   += price;
        sumXSq += price * price;

        int    n        = window.size();
        double mean     = sumX / n;
        double variance = (sumXSq / n) - (mean * mean);
        double stddev   = variance > 0 ? Math.sqrt(variance) : 1.0;
        double z        = (price - mean) / stddev;

        boolean isAnomaly = Math.abs(z) > Z_THRESHOLD && n >= 10;
        if (isAnomaly) {
            log.warn("ANOMALY: price={} z={}", price, String.format("%.2f", z));
        }
        return new AnomalyResult(price, z, mean, stddev, isAnomaly);
    }

    public record AnomalyResult(
        double  price,
        double  zScore,
        double  rollingMean,
        double  rollingStddev,
        boolean isAnomaly
    ) {}
}