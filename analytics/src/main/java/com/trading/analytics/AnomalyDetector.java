package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.Deque;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AnomalyDetector {

    private static final Logger log = LoggerFactory.getLogger(AnomalyDetector.class);

    private static final int    WINDOW_SIZE   = 60;
    // Raised from 2.5 → 3.0: financial price series have fat tails;
    // 2.5 triggers too many false positives during normal volatility.
    private static final double Z_THRESHOLD   = 3.0;
    // Require at least 30 samples before alerting to avoid startup noise.
    private static final int    MIN_SAMPLES   = 30;

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
        // Use sample variance (n-1) for better estimation
        double variance = n > 1 ? ((sumXSq - (sumX * sumX / n)) / (n - 1)) : 0.0;
        double stddev   = variance > 1e-10 ? Math.sqrt(variance) : Double.MAX_VALUE;
        double z        = (price - mean) / stddev;

        // Only alert after MIN_SAMPLES to avoid startup false positives
        boolean isAnomaly = n >= MIN_SAMPLES && Math.abs(z) > Z_THRESHOLD;
        if (isAnomaly) {
            log.warn("ANOMALY detected: price={:.2f} z={:.2f} mean={:.2f} stddev={:.2f}",
                     price, z, mean, stddev);
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