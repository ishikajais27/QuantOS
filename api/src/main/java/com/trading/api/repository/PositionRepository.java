package com.trading.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trading.api.entity.Position;

public interface PositionRepository extends JpaRepository<Position, String> {
    List<Position>    findByAccountId(String accountId);
    Optional<Position> findByAccountIdAndInstrumentId(String accountId, String instrumentId);
}