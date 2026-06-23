package com.trading.push;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MarketDataPushService {

    private static final Logger log = LoggerFactory.getLogger(MarketDataPushService.class);

    private final SimpMessagingTemplate broker;
    private final ObjectMapper          mapper;
    private final Random                rng = new Random();

    private final Map<String, List<Map<String, Object>>> bidDepth = new HashMap<>();
    private final Map<String, List<Map<String, Object>>> askDepth = new HashMap<>();

    public MarketDataPushService(SimpMessagingTemplate broker, ObjectMapper mapper) {
        this.broker = broker;
        this.mapper = mapper;
    }

    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            String body    = new String(message.getBody());
            String instrument = channel.replace("market:", "");

            JsonNode event = mapper.readTree(body);
            double   price = event.path("price").asDouble(22450.0);
            double   bid   = event.path("bid").asDouble(price - 0.5);
            double   ask   = event.path("ask").asDouble(price + 0.5);

            List<Map<String, Object>> bids = buildDepth(bid, -1, 5);
            List<Map<String, Object>> asks = buildDepth(ask,  1, 5);

            bidDepth.put(instrument, bids);
            askDepth.put(instrument, asks);

            ObjectNode payload = mapper.createObjectNode();
            payload.put("instrument", instrument);
            payload.put("price", price);
            payload.set("bids", mapper.valueToTree(bids));
            payload.set("asks", mapper.valueToTree(asks));
            payload.put("timestamp", System.currentTimeMillis());

            broker.convertAndSend("/topic/" + instrument, payload.toString());
            log.debug("Pushed to /topic/{}: price={}", instrument, price);

        } catch (Exception e) {
            log.error("Push failed: {}", e.getMessage());
        }
    }

    private List<Map<String, Object>> buildDepth(double basePrice, int direction, int levels) {
        List<Map<String, Object>> depth = new ArrayList<>();
        for (int i = 0; i < levels; i++) {
            double price  = basePrice + direction * i * 0.25 + (rng.nextDouble() - 0.5) * 0.05;
            long   volume = 100L + rng.nextInt(1000);
            Map<String, Object> level = new LinkedHashMap<>();
            level.put("price",  Math.round(price * 100.0) / 100.0);
            level.put("volume", volume);
            depth.add(level);
        }
        return depth;
    }
}