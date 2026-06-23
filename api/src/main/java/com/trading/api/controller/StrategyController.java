package com.trading.api.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/strategy")
public class StrategyController {

    private static final Logger log = LoggerFactory.getLogger(StrategyController.class);

    @PostMapping("/twap")
    public ResponseEntity<Map<String, String>> startTWAP(@RequestBody Map<String, Object> params) {
        log.info("TWAP strategy requested: {}", params);
        return ResponseEntity.ok(Map.of(
            "status",  "queued",
            "type",    "TWAP",
            "message", "TWAP strategy queued for instrument: " + params.get("instrumentId")
        ));
    }

    @PostMapping("/vwap")
    public ResponseEntity<Map<String, String>> startVWAP(@RequestBody Map<String, Object> params) {
        log.info("VWAP strategy requested: {}", params);
        return ResponseEntity.ok(Map.of(
            "status",  "queued",
            "type",    "VWAP",
            "message", "VWAP strategy queued for instrument: " + params.get("instrumentId")
        ));
    }
}