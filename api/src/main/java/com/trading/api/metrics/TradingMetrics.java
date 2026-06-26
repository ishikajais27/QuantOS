package com.trading.api.metrics;

import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Component;

/**
 * Custom Prometheus metrics for the trading platform.
 * These counters and timers are scraped by Prometheus every 15s
 * and visualised in Grafana dashboards.
 *
 * Naming follows Prometheus convention: snake_case with unit suffix.
 */
@Component
public class TradingMetrics {

    private final Counter  ordersPlaced;
    private final Counter  ordersCancelled;
    private final Counter  tradeMatches;
    private final Counter  rateLimitHits;
    private final Timer    orderLatency;

    public TradingMetrics(MeterRegistry registry) {
        this.ordersPlaced = Counter.builder("trading_orders_placed_total")
                .description("Total orders submitted to the matching engine")
                .register(registry);

        this.ordersCancelled = Counter.builder("trading_orders_cancelled_total")
                .description("Total orders cancelled")
                .register(registry);

        this.tradeMatches = Counter.builder("trading_matches_total")
                .description("Total successful trade matches")
                .register(registry);

        this.rateLimitHits = Counter.builder("trading_rate_limit_hits_total")
                .description("Requests rejected by rate limiter")
                .register(registry);

        // P50/P95/P99 latency histogram for order placement end-to-end
        this.orderLatency = Timer.builder("trading_order_latency_seconds")
                .description("End-to-end order placement latency")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
    }

    public void recordOrderPlaced()    { ordersPlaced.increment(); }
    public void recordOrderCancelled() { ordersCancelled.increment(); }
    public void recordMatch()          { tradeMatches.increment(); }
    public void recordRateLimitHit()   { rateLimitHits.increment(); }

    public Timer.Sample startTimer()   { return Timer.start(); }
    public void stopTimer(Timer.Sample sample) { sample.stop(orderLatency); }
}