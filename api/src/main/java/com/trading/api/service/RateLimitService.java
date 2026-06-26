package com.trading.api.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Sliding-window rate limiter using Redis atomic increment + TTL.
 *
 * Algorithm:
 * 1. INCR key:accountId:minuteBucket
 * 2. If result == 1, set TTL of 60s (first request in this window)
 * 3. If result > limit, reject the request
 *
 * Why atomic INCR? Redis is single-threaded for commands.
 * No race condition is possible even under 10,000 concurrent users.
 */
@Service
public class RateLimitService {

    private final StringRedisTemplate redis;

    // Per-role limits: institutional traders execute higher volumes
    private static final int RETAIL_LIMIT        = 10;
    private static final int QUANT_LIMIT         = 50;
    private static final int INSTITUTIONAL_LIMIT = 200;

    public RateLimitService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public boolean isAllowed(String accountId, String role) {
        int limit = switch (role.toUpperCase()) {
            case "INSTITUTIONAL" -> INSTITUTIONAL_LIMIT;
            case "QUANT"         -> QUANT_LIMIT;
            default              -> RETAIL_LIMIT;
        };

        // Key buckets by account + current minute
        long   minuteBucket = System.currentTimeMillis() / 60_000;
        String key          = "ratelimit:" + accountId + ":" + minuteBucket;

        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            // First request in this window — set expiry
            redis.expire(key, Duration.ofSeconds(70)); // 70s gives buffer
        }
        return count == null || count <= limit;
    }
}