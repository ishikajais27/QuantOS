package com.trading.api;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository accountRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AccountService(AccountRepository accountRepo) {
        this.accountRepo = accountRepo;
    }

    public Account register(String email, String password) {
        Account account = new Account();
        account.setEmail(email);
        account.setPasswordHash(encoder.encode(password));
        return accountRepo.save(account);
    }

    public boolean authenticate(String email, String password) {
        return accountRepo.findByEmail(email)
            .map(a -> encoder.matches(password, a.getPasswordHash()))
            .orElse(false);
    }

    public Account getByEmail(String email) {
        return accountRepo.findByEmail(email).orElseThrow();
    }
}