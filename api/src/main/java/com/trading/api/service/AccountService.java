package com.trading.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.trading.api.entity.Account;
import com.trading.api.repository.AccountRepository;

@Service
public class AccountService {

    private final AccountRepository repo;
    private final PasswordEncoder   encoder;

    public AccountService(AccountRepository repo, PasswordEncoder encoder) {
        this.repo    = repo;
        this.encoder = encoder;
    }

    public Account register(String email, String password) {
        Account a = new Account();
        a.setEmail(email);
        a.setPasswordHash(encoder.encode(password));
        return repo.save(a);
    }

    public boolean authenticate(String email, String password) {
        return repo.findByEmail(email)
                   .map(a -> encoder.matches(password, a.getPasswordHash()))
                   .orElse(false);
    }

    public Account getByEmail(String email) {
        return repo.findByEmail(email).orElseThrow();
    }
}