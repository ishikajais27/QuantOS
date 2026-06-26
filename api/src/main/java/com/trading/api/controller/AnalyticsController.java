package com.trading.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final StringRedisTemplate redis;
    private final ObjectMapper        mapper;

    public AnalyticsController(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis  = redis;
        this.mapper = mapper;
    }

    @GetMapping("/volatility")
    public ResponseEntity<Object> getVolatility() throws Exception {
        String raw = redis.opsForValue().get("analytics:volatility");
        return ResponseEntity.ok(raw != null ? mapper.readValue(raw, Map.class) : Map.of());
    }

    @GetMapping("/anomaly")
    public ResponseEntity<Object> getAnomaly() throws Exception {
        String raw = redis.opsForValue().get("analytics:anomaly:latest");
        return ResponseEntity.ok(raw != null ? mapper.readValue(raw, Map.class) : Map.of("isAnomaly", false));
    }

    @GetMapping("/support-resistance")
    public ResponseEntity<Object> getSupportResistance() throws Exception {
        String raw = redis.opsForValue().get("analytics:sr_levels");
        return ResponseEntity.ok(raw != null ? mapper.readValue(raw, Map.class) : Map.of());
    }
}