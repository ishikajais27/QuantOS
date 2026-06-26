package com.trading.api.repository;

import com.trading.api.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByUsername(String username);

    // Login with either email or username
    @Query("SELECT a FROM Account a WHERE a.email = :identifier OR a.username = :identifier")
    Optional<Account> findByEmailOrUsername(@Param("identifier") String identifier);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}