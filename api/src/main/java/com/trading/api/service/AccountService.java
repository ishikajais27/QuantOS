package com.trading.api.service;

import com.trading.api.entity.Account;
import com.trading.api.repository.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository repo;
    private final PasswordEncoder   encoder;

    public AccountService(AccountRepository repo, PasswordEncoder encoder) {
        this.repo    = repo;
        this.encoder = encoder;
    }

    /**
     * Primary registration method — accepts role explicitly.
     * Called by AuthController during signup.
     */
    public Account register(String email, String password, String role) {
        Account a = new Account();
        a.setEmail(email.trim().toLowerCase());
        a.setPasswordHash(encoder.encode(password));
        a.setRole(role != null ? role.toUpperCase() : "TRADER");
        return repo.save(a);
    }

    /**
     * Convenience overload — defaults role to TRADER.
     * Keeps any existing callers working without changes.
     */
    public Account register(String email, String password) {
        return register(email, password, "TRADER");
    }

    public boolean authenticate(String email, String password) {
        return repo.findByEmail(email.trim().toLowerCase())
                   .map(a -> encoder.matches(password, a.getPasswordHash()))
                   .orElse(false);
    }

    public Account getByEmail(String email) {
        return repo.findByEmail(email.trim().toLowerCase()).orElseThrow();
    }
}