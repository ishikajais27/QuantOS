package com.trading.push;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class MarketDataPushService {

    private final WebSocketHandler wsHandler;
    private final RedisTemplate<String, Object> redisTemplate;

    public MarketDataPushService(WebSocketHandler wsHandler,
                                  RedisTemplate<String, Object> redisTemplate) {
        this.wsHandler     = wsHandler;
        this.redisTemplate = redisTemplate;
    }

    @Scheduled(fixedDelay = 100)
    public void pushMarketUpdates() {
        Object niftyData = redisTemplate.opsForValue().get("market:NIFTY-FUT");
        if (niftyData != null) {
            wsHandler.broadcast("NIFTY-FUT", niftyData.toString());
        }
        Object btcData = redisTemplate.opsForValue().get("market:BTCUSDT");
        if (btcData != null) {
            wsHandler.broadcast("BTCUSDT", btcData.toString());
        }
    }
}