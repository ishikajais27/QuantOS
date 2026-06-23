package com.trading.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trading.api.entity.Account;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByEmail(String email);
}