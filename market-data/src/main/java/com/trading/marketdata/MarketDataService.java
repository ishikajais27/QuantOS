package com.trading.marketdata;

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

    private static final String CHANNEL_PREFIX = "market:";

    private final FeedNormalizer      normalizer = new FeedNormalizer();
    private final FIXParser           fixParser  = new FIXParser();
    private final StringRedisTemplate redis;
    private final ObjectMapper        mapper;
    private final Random              rng        = new Random();

    // Simulated price state
    private double niftyPrice   = 22450.5;
    private double btcPrice     = 42000.0;
    private long   niftyVolume  = 12000;

    public MarketDataService(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis  = redis;
        this.mapper = mapper;
    }

    @Scheduled(fixedDelay = 1000)
    public void consumeFeeds() {
        // Drift simulated prices slightly each tick
        niftyPrice  += (rng.nextDouble() - 0.49) * 15;
        btcPrice    += (rng.nextDouble() - 0.49) * 120;
        niftyVolume  = 10000 + rng.nextInt(5000);

        double niftyBid = niftyPrice - 0.50;
        double niftyAsk = niftyPrice + 0.50;

        String rawZerodha = String.format(
                "symbol=NIFTY-FUT&ltp=%.2f&volume=%d&timestamp=%d&bid=%.2f&ask=%.2f",
                niftyPrice, niftyVolume, System.currentTimeMillis(), niftyBid, niftyAsk);

        String rawBinance = String.format(
                "{\"s\":\"BTCUSDT\",\"p\":\"%.2f\",\"q\":\"1.5\"}",
                btcPrice);

        String rawFIX = String.format(
                "8=FIX.4.4|35=D|49=SENDER|56=TARGET|55=RELIANCE|44=%.2f|38=100|",
                niftyPrice);

        MarketEvent zerodhaEvent = normalizer.normalizeZerodha(rawZerodha);
        MarketEvent binanceEvent = normalizer.normalizeBinance(rawBinance);
        Map<String, String> fixTags = fixParser.parse(rawFIX);

        publishToRedis("NIFTY-FUT", zerodhaEvent);
        publishToRedis("BTCUSDT",   binanceEvent);

        log.debug("Zerodha: {}", zerodhaEvent);
        log.debug("Binance: {}", binanceEvent);
        log.debug("FIX tag 55 (symbol): {}", fixTags.get("55"));
        fixParser.clear();
    }

    private void publishToRedis(String instrument, MarketEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            redis.convertAndSend(CHANNEL_PREFIX + instrument, payload);
        } catch (Exception e) {
            log.error("Failed to publish to Redis channel {}: {}", instrument, e.getMessage());
        }
    }

    public void handleGap(String exchange, long lastSeq, long currentSeq) {
        if (currentSeq - lastSeq > 1) {
            log.warn("Gap detected on {} from {} to {} — would reconnect", exchange, lastSeq, currentSeq);
        }
    }
}