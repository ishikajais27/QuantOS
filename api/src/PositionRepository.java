package com.trading.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, String> {
    List<Position> findByAccountId(String accountId);
    Optional<Position> findByAccountIdAndInstrumentId(String accountId, String instrumentId);
}