package com.trading.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final TradeRepository tradeRepo;

    public MarketController(TradeRepository tradeRepo) {
        this.tradeRepo = tradeRepo;
    }

    @GetMapping("/{instrumentId}/trades")
    public ResponseEntity<List<Trade>> recentTrades(@PathVariable String instrumentId) {
        return ResponseEntity.ok(
            tradeRepo.findByInstrumentIdOrderByTradedAtDesc(instrumentId)
        );
    }
}