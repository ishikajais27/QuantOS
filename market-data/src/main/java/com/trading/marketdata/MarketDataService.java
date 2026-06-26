package com.trading.marketdata;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MarketDataService {

    private static final Logger log = LoggerFactory.getLogger(MarketDataService.class);

    /*
     * WHY THIS CONSTANT MATTERS:
     * market-data publishes to  → "market:NIFTY-FUT"
     * push subscribes pattern   → "market:*"
     * push relays to STOMP      → "/topic/NIFTY-FUT"
     * Frontend subscribes to    → "/topic/NIFTY-FUT"
     * The prefix must be identical across all three services.
     */
    private static final String CHANNEL_PREFIX = "market:";

    private final FeedNormalizer      normalizer = new FeedNormalizer();
    private final FIXParser           fixParser  = new FIXParser();
    private final StringRedisTemplate redis;
    private final ObjectMapper        mapper;
    private final Random              rng        = new Random();

    // Simulated price state — matches original field names exactly
    private double niftyPrice  = 22450.5;
    private double btcPrice    = 42000.0;
    private long   niftyVolume = 12000;

    public MarketDataService(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis  = redis;
        this.mapper = mapper;
    }

    @Scheduled(fixedDelay = 1000)
    public void consumeFeeds() {
        // Price drift — unchanged from original
        niftyPrice  += (rng.nextDouble() - 0.49) * 15;
        btcPrice    += (rng.nextDouble() - 0.49) * 120;
        niftyVolume  = 10000 + rng.nextInt(5000);

        double niftyBid = niftyPrice - 0.50;
        double niftyAsk = niftyPrice + 0.50;

        String rawZerodha = String.format(
                "symbol=NIFTY-FUT&ltp=%.2f&volume=%d&timestamp=%d&bid=%.2f&ask=%.2f",
                niftyPrice, niftyVolume, System.currentTimeMillis(), niftyBid, niftyAsk);

        String rawBinance = String.format(
                "{\"s\":\"BTCUSDT\",\"p\":\"%.2f\",\"q\":\"1.5\"}", btcPrice);

        String rawFIX = String.format(
                "8=FIX.4.4|35=D|49=SENDER|56=TARGET|55=RELIANCE|44=%.2f|38=100|",
                niftyPrice);

        MarketEvent zerodhaEvent = normalizer.normalizeZerodha(rawZerodha);
        MarketEvent binanceEvent = normalizer.normalizeBinance(rawBinance);
        Map<String, String> fixTags = fixParser.parse(rawFIX);

        /*
         * FIX from original: publishToRedis(String, MarketEvent) only sent the flat
         * MarketEvent JSON. The frontend OrderBookTable component expects:
         *   { bids: [{price, volume}, ...], asks: [{price, volume}, ...], price: number }
         *
         * The old flat object had no "bids" or "asks" arrays, so every WebSocket
         * message arrived and was silently ignored by the frontend (parsed.bids was
         * undefined). The order book stayed empty forever.
         *
         * Fix: publishOrderBook() generates a 10-level synthetic depth ladder
         * around the mid price and serialises it in the exact shape the frontend reads.
         */
        publishOrderBook("NIFTY-FUT", zerodhaEvent);
        publishOrderBook("BTCUSDT",   binanceEvent);

        log.debug("Zerodha: {}", zerodhaEvent);
        log.debug("Binance: {}", binanceEvent);
        log.debug("FIX tag 55 (symbol): {}", fixTags.get("55"));
        fixParser.clear();
    }

    /**
     * Builds a synthetic 10-level order book around the mid price and publishes
     * it to the Redis Pub/Sub channel that the push service subscribes to.
     *
     * Published JSON shape (matches what frontend OrderBookTable + DepthChart read):
     * {
     *   "symbol":    "NIFTY-FUT",
     *   "price":     22450.50,
     *   "exchange":  "ZERODHA",
     *   "volume":    12345,
     *   "timestamp": 1719381439000,
     *   "bids": [
     *     { "price": 22450.00, "volume": 1420 },
     *     { "price": 22449.50, "volume": 980  },
     *     ...
     *   ],
     *   "asks": [
     *     { "price": 22451.00, "volume": 760  },
     *     { "price": 22451.50, "volume": 1100 },
     *     ...
     *   ]
     * }
     */
    private void publishOrderBook(String instrument, MarketEvent event) {
        try {
            double mid      = event.getPrice();
            // BTCUSDT has larger tick; NIFTY-FUT uses 0.50
            double tickSize = instrument.equals("BTCUSDT") ? 1.0 : 0.50;

            List<Map<String, Object>> bids = new ArrayList<>();
            List<Map<String, Object>> asks = new ArrayList<>();

            for (int level = 1; level <= 10; level++) {
                // Round to 2 decimal places to avoid floating-point noise
                double bidPrice = Math.round((mid - level * tickSize) * 100.0) / 100.0;
                double askPrice = Math.round((mid + level * tickSize) * 100.0) / 100.0;
                long   bidVol   = 200L + rng.nextInt(2000);
                long   askVol   = 200L + rng.nextInt(2000);

                bids.add(Map.of("price", bidPrice, "volume", bidVol));
                asks.add(Map.of("price", askPrice, "volume", askVol));
            }

            Map<String, Object> payload = Map.of(
                    "symbol",    event.getSymbol() != null ? event.getSymbol() : instrument,
                    "price",     mid,
                    "exchange",  event.getExchange() != null ? event.getExchange() : "UNKNOWN",
                    "volume",    event.getVolume(),
                    "timestamp", System.currentTimeMillis(),
                    "bids",      bids,
                    "asks",      asks
            );

            String json = mapper.writeValueAsString(payload);

            /*
             * convertAndSend uses Redis PUBLISH command (Pub/Sub).
             * This will now succeed because REDIS_HOST=redis is set in docker-compose,
             * making the connection factory resolve to the correct container.
             */
            redis.convertAndSend(CHANNEL_PREFIX + instrument, json);
            log.debug("Published order book to channel {} ({} bid levels, {} ask levels)",
                      CHANNEL_PREFIX + instrument, bids.size(), asks.size());

        } catch (Exception e) {
            log.error("Failed to publish to Redis channel {}: {}", instrument, e.getMessage());
        }
    }

    public void handleGap(String exchange, long lastSeq, long currentSeq) {
        if (currentSeq - lastSeq > 1) {
            log.warn("Gap detected on {} from {} to {} — would reconnect",
                     exchange, lastSeq, currentSeq);
        }
    }
}