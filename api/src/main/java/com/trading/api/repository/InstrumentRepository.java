package com.trading.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trading.api.entity.Instrument;

public interface InstrumentRepository extends JpaRepository<Instrument, String> {}