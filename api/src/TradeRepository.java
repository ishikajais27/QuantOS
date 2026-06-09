package com.trading.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, String> {
    List<Trade> findByInstrumentIdOrderByTradedAtDesc(String instrumentId);
    List<Trade> findByBuyAccountIdOrSellAccountId(String buyId, String sellId);
    List<Trade> findByInstrumentIdAndTradedAtBetween(String instrumentId, Instant from, Instant to);
}