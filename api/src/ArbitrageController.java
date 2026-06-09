
package com.trading.api;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.List;

@RestController
@RequestMapping("/api/arbitrage")
public class ArbitrageController {

    private final RedisTemplate<String, Object> redisTemplate;

    public ArbitrageController(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/opportunities")
    public ResponseEntity<Object> getOpportunities() {
        // Bellman-Ford results are stored in Redis by analytics module
        Object opportunities = redisTemplate.opsForValue().get("arbitrage:latest");
        return ResponseEntity.ok(opportunities != null ? opportunities : List.of());
    }
}