package com.trading.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/arbitrage")
public class ArbitrageController {

    private final StringRedisTemplate redis;
    private final ObjectMapper        mapper;

    public ArbitrageController(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis  = redis;
        this.mapper = mapper;
    }

    @GetMapping("/opportunities")
    public ResponseEntity<Object> getOpportunities() {
        try {
            String raw = redis.opsForValue().get("arbitrage:latest");
            if (raw == null || raw.isBlank()) return ResponseEntity.ok(List.of());
            return ResponseEntity.ok(mapper.readValue(raw, List.class));
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}