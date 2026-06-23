package com.trading.analytics;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class AnalyticsScheduler {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsScheduler.class);

    private final BellmanFordService        bellmanFord;
    private final PortfolioOptimizer        optimizer;
    private final SupportResistanceDetector srDetector;
    private final VolatilityEngine          volatility;
    private final VWAPCalculator            vwap;
    private final StringRedisTemplate       redis;
    private final ObjectMapper              mapper;

    // Rolling price buffer for analytics
    private final double[] priceBuffer = new double[50];
    private int            bufferIndex = 0;
    private double         basePrice   = 22450.0;
    private final Random   rng         = new Random();

    public AnalyticsScheduler(BellmanFordService bellmanFord,
                               PortfolioOptimizer optimizer,
                               SupportResistanceDetector srDetector,
                               VolatilityEngine volatility,
                               VWAPCalculator vwap,
                               StringRedisTemplate redis,
                               ObjectMapper mapper) {
        this.bellmanFord = bellmanFord;
        this.optimizer   = optimizer;
        this.srDetector  = srDetector;
        this.volatility  = volatility;
        this.vwap        = vwap;
        this.redis       = redis;
        this.mapper      = mapper;
    }

    @Scheduled(fixedDelay = 10_000)
    public void runArbitrageCheck() {
        try {
            Map<String, Map<String, Double>> rates = bellmanFord.buildSampleRates();
            List<String> cycle = bellmanFord.detectArbitrage(rates);

            List<Map<String, Object>> opportunities = new ArrayList<>();
            if (!cycle.isEmpty()) {
                Map<String, Object> opp = new LinkedHashMap<>();
                opp.put("cycle", cycle);
                opp.put("profitBps", 12 + rng.nextInt(30));
                opp.put("detectedAt", System.currentTimeMillis());
                opportunities.add(opp);
                log.info("Arbitrage cycle detected: {}", cycle);
            }

            // Always store a demo opportunity so the frontend has something to show
            if (opportunities.isEmpty()) {
                Map<String, Object> demo = new LinkedHashMap<>();
                demo.put("cycle", List.of("USD", "EUR", "GBP", "USD"));
                demo.put("profitBps", 5 + rng.nextInt(15));
                demo.put("detectedAt", System.currentTimeMillis());
                opportunities.add(demo);
            }

            redis.opsForValue().set("arbitrage:latest",
                    mapper.writeValueAsString(opportunities), 60, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Arbitrage check failed: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 2_000)
    public void runPriceAnalytics() {
        try {
            // Simulate price tick
            basePrice += (rng.nextDouble() - 0.49) * 20;
            priceBuffer[bufferIndex % 50] = basePrice;
            bufferIndex++;

            long volume = 100 + rng.nextInt(500);
            volatility.update(basePrice);
            double currentVwap = vwap.update(basePrice, volume);

            // Store volatility in Redis
            Map<String, Object> volData = Map.of(
                    "annualizedVol", volatility.getAnnualizedVolatility(),
                    "variance",      volatility.getVariance(),
                    "vwap",          currentVwap,
                    "price",         basePrice,
                    "timestamp",     System.currentTimeMillis()
            );
            redis.opsForValue().set("analytics:volatility",
                    mapper.writeValueAsString(volData), 30, TimeUnit.SECONDS);

            if (bufferIndex >= 10) {
                double[] prices = Arrays.copyOf(priceBuffer, Math.min(bufferIndex, 50));
                Map<String, List<Double>> levels = srDetector.detect(prices);
                redis.opsForValue().set("analytics:sr_levels",
                        mapper.writeValueAsString(levels), 30, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            log.error("Price analytics failed: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 30_000)
    public void runPortfolioOptimization() {
        try {
            List<double[]> portfolios = List.of(
                    new double[]{0.05, 0.08}, new double[]{0.08, 0.12},
                    new double[]{0.12, 0.15}, new double[]{0.15, 0.17},
                    new double[]{0.20, 0.18}, new double[]{0.25, 0.19},
                    new double[]{0.30, 0.195}
            );
            List<double[]> frontier = optimizer.efficientFrontier(portfolios);
            redis.opsForValue().set("analytics:frontier",
                    mapper.writeValueAsString(frontier), 120, TimeUnit.SECONDS);
            log.info("Efficient frontier computed: {} points", frontier.size());
        } catch (Exception e) {
            log.error("Portfolio optimization failed: {}", e.getMessage());
        }
    }
}