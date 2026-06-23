package com.trading.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trading.api.entity.Trade;
import com.trading.api.repository.TradeRepository;

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