package com.trading.strategy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/strategy")
public class StrategyController {

    private static final Logger log = LoggerFactory.getLogger(StrategyController.class);

    @PostMapping("/twap")
    public ResponseEntity<Map<String, String>> executeTWAP(@RequestBody Map<String, Object> params) {
        log.info("TWAP execution requested — instrument={} qty={} duration={}ms slices={}",
                params.get("instrumentId"), params.get("quantity"),
                params.get("durationMs"),   params.get("slices"));
        return ResponseEntity.ok(Map.of("status", "executing", "type", "TWAP"));
    }

    @PostMapping("/vwap")
    public ResponseEntity<Map<String, String>> executeVWAP(@RequestBody Map<String, Object> params) {
        log.info("VWAP execution requested — instrument={} qty={}",
                params.get("instrumentId"), params.get("quantity"));
        return ResponseEntity.ok(Map.of("status", "executing", "type", "VWAP"));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}