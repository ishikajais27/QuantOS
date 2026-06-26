package com.trading.api.service;

import com.trading.api.entity.Account;
import com.trading.api.repository.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository repo;
    private final PasswordEncoder   encoder;

    public AccountService(AccountRepository repo, PasswordEncoder encoder) {
        this.repo    = repo;
        this.encoder = encoder;
    }

    /**
     * Primary registration — called by AuthController.
     * Parameter order matches AuthController.register():
     *   accountService.register(name, email, password, role)
     */
    public Account register(String name, String email, String password, String role) {
        String username = name != null ? name.trim().toLowerCase().replaceAll("\\s+", "") : null;
        return register(name, username, email, password, role);
    }

    /**
     * Full registration with explicit username — called by DataInitializer.
     */
    public Account register(String name, String username, String email,
                            String password, String role) {
        if (repo.existsByEmail(email.trim().toLowerCase())) {
            throw new IllegalArgumentException("Email already in use: " + email);
        }
        if (username != null && repo.existsByUsername(username.trim())) {
            throw new IllegalArgumentException("Username already taken: " + username);
        }

        Account a = new Account();
        a.setName(name != null ? name.trim() : email.split("@")[0]);
        a.setUsername(username != null ? username.trim() : null);
        a.setEmail(email.trim().toLowerCase());
        a.setPasswordHash(encoder.encode(password));
        a.setRole(role != null ? role.toUpperCase() : "RETAIL");
        return repo.save(a);
    }

    /**
     * Authenticate using email OR username + password.
     * Returns the Account if credentials are valid, or empty.
     */
    public Optional<Account> authenticate(String identifier, String password) {
        return repo.findByEmailOrUsername(identifier.trim())
                   .filter(a -> Boolean.TRUE.equals(a.getIsActive()))
                   .filter(a -> encoder.matches(password, a.getPasswordHash()))
                   .map(a -> {
                       a.setLastLogin(Instant.now());
                       return repo.save(a);
                   });
    }

    public Optional<Account> findByEmail(String email) {
        return repo.findByEmail(email.trim().toLowerCase());
    }

    public boolean checkPassword(Account account, String raw) {
        return encoder.matches(raw, account.getPasswordHash());
    }
}