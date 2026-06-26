package com.trading.push;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MarketDataRelay implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(MarketDataRelay.class);

    private final SimpMessagingTemplate messaging;
    private final ObjectMapper          mapper;
    private final Random                rng        = new Random();
    private final Map<String, Double>   lastPrices = new HashMap<>();

    public MarketDataRelay(SimpMessagingTemplate messaging,
                           ObjectMapper mapper,
                           RedisMessageListenerContainer listenerContainer) {
        this.messaging = messaging;
        this.mapper    = mapper;
        listenerContainer.addMessageListener(this, new PatternTopic("market:*"));
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel    = new String(message.getChannel());
            String body       = new String(message.getBody());
            String instrument = channel.replace("market:", "");

            // Fix: use Map<String, Object> instead of Map<?, ?>
            // This allows Java to resolve the value type at compile time
            @SuppressWarnings("unchecked")
            Map<String, Object> event = mapper.readValue(body, Map.class);

            // getOrDefault returns Object — cast to Number first, then doubleValue()
            Object priceObj = event.getOrDefault("price", 0.0);
            double price    = ((Number) priceObj).doubleValue();

            if (price <= 0) return;

            lastPrices.put(instrument, price);

            Map<String, Object> snapshot = buildOrderBook(instrument, price);
            messaging.convertAndSend("/topic/" + instrument, snapshot);
            log.debug("Pushed {} @ {}", instrument, price);

        } catch (Exception e) {
            log.error("Relay error: {}", e.getMessage());
        }
    }

    private Map<String, Object> buildOrderBook(String instrument, double price) {
        List<Map<String, Object>> bids = new ArrayList<>();
        List<Map<String, Object>> asks = new ArrayList<>();

        double tickSize = (instrument.contains("BTC") || instrument.contains("ETH"))
                          ? 10.0
                          : 0.5;

        for (int i = 1; i <= 10; i++) {
            double bidPrice = price - (i * tickSize) + (rng.nextDouble() - 0.5) * tickSize * 0.1;
            double askPrice = price + (i * tickSize) + (rng.nextDouble() - 0.5) * tickSize * 0.1;

            long bidVol = (long) (5000.0 / i) + rng.nextInt(1000);
            long askVol = (long) (4800.0 / i) + rng.nextInt(1000);

            bids.add(Map.of("price", round(bidPrice, 2), "volume", bidVol));
            asks.add(Map.of("price", round(askPrice, 2), "volume", askVol));
        }

        return Map.of(
            "instrument", instrument,
            "price",      round(price, 2),
            "bids",       bids,
            "asks",       asks,
            "timestamp",  System.currentTimeMillis()
        );
    }

    private double round(double val, int places) {
        double scale = Math.pow(10, places);
        return Math.round(val * scale) / scale;
    }
}