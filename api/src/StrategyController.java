package com.trading.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/strategy")
public class StrategyController {

    @PostMapping("/twap")
    public ResponseEntity<String> startTWAP(@RequestBody Map<String, Object> params) {
        // Forwards to strategy module
        return ResponseEntity.ok("TWAP strategy queued: " + params.get("instrumentId"));
    }

    @PostMapping("/vwap")
    public ResponseEntity<String> startVWAP(@RequestBody Map<String, Object> params) {
        return ResponseEntity.ok("VWAP strategy queued: " + params.get("instrumentId"));
    }
}