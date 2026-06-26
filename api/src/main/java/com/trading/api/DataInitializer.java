
package com.trading.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.trading.api.repository.AccountRepository;
import com.trading.api.service.AccountService;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AccountService    accountService;
    private final AccountRepository accountRepository;

    public DataInitializer(AccountService accountService, AccountRepository accountRepository) {
        this.accountService    = accountService;
        this.accountRepository = accountRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        create("test@gmail.com",       "test123", "RETAIL",        "Demo Retail");
        create("quant@gmail.com",      "test123", "QUANT",         "Demo Quant");
        create("inst@gmail.com",       "test123", "INSTITUTIONAL", "Demo Institutional");
        create("testuser@example.com", "Test@1234", "QUANT",       "Test User");

        log.info("Demo accounts ready: test@gmail.com / quant@gmail.com / inst@gmail.com (password: test123)");
    }

    private void create(String email, String password, String role, String name) {
        if (accountRepository.findByEmail(email.trim().toLowerCase()).isPresent()) return;
        try {
        accountService.register(name, email, password, role);
            log.info("Seeded: {} ({})", email, role);
        } catch (Exception e) {
            log.warn("Could not seed {}: {}", email, e.getMessage());
        }
    }
}