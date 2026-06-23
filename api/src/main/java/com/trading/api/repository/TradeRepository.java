package com.trading.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trading.api.entity.Trade;

public interface TradeRepository extends JpaRepository<Trade, String> {
    List<Trade> findByInstrumentIdOrderByTradedAtDesc(String instrumentId);
    List<Trade> findByBuyAccountIdOrSellAccountId(String buyId, String sellId);
}