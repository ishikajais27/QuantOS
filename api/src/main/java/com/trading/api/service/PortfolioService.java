package com.trading.api.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.trading.api.entity.Position;
import com.trading.api.repository.PositionRepository;
import com.trading.api.repository.TradeRepository;

@Service
public class PortfolioService {

    private final PositionRepository positionRepo;
    private final TradeRepository    tradeRepo;

    public PortfolioService(PositionRepository positionRepo, TradeRepository tradeRepo) {
        this.positionRepo = positionRepo;
        this.tradeRepo    = tradeRepo;
    }

    public List<Position> getPositions(String accountId) {
        return positionRepo.findByAccountId(accountId);
    }

    public double getTotalPnl(String accountId) {
        return positionRepo.findByAccountId(accountId)
                .stream()
                .mapToDouble(p -> p.getUnrealizedPnl() != null ? p.getUnrealizedPnl() : 0.0)
                .sum();
    }

    public void updatePosition(String accountId, String instrumentId, long qty, double price) {
        Position pos = positionRepo
                .findByAccountIdAndInstrumentId(accountId, instrumentId)
                .orElseGet(() -> {
                    Position p = new Position();
                    p.setAccountId(accountId);
                    p.setInstrumentId(instrumentId);
                    p.setQuantity(0L);
                    p.setAveragePrice(0.0);
                    return p;
                });

        long newQty = pos.getQuantity() + qty;
        if (newQty == 0) {
            pos.setAveragePrice(0.0);
        } else {
            pos.setAveragePrice(
                (pos.getAveragePrice() * pos.getQuantity() + price * qty) / newQty
            );
        }
        pos.setQuantity(newQty);
        positionRepo.save(pos);
    }
}