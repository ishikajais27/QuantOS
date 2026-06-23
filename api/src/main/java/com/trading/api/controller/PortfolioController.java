package com.trading.api.controller;

import com.trading.api.entity.Position;
import com.trading.api.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/{accountId}/positions")
    public ResponseEntity<List<Position>> positions(@PathVariable String accountId) {
        return ResponseEntity.ok(portfolioService.getPositions(accountId));
    }

    @GetMapping("/{accountId}/pnl")
    public ResponseEntity<Double> pnl(@PathVariable String accountId) {
        return ResponseEntity.ok(portfolioService.getTotalPnl(accountId));
    }
}