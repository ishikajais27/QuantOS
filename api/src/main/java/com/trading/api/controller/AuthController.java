package com.trading.api.controller;

import com.trading.api.entity.Account;
import com.trading.api.service.AccountService;
import com.trading.api.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AccountService accountService;
    private final JwtUtil        jwtUtil;

    public AuthController(AccountService accountService, JwtUtil jwtUtil) {
        this.accountService = accountService;
        this.jwtUtil        = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String name     = body.get("name");
        String role     = body.getOrDefault("role", "RETAIL");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email is required"));
        }
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "password is required"));
        }

        try {
            /*
             * FIX: AccountService.register signature is (email, password, role, name).
             * Previous code had parameters in the wrong order:
             *   accountService.register(name, email, password, role)   ← WRONG
             * which silently shuffled every field — email stored the name,
             * password was hashed from the email string, role became the
             * raw password text, and name received the role string.
             * Every account created through the signup form was unusable.
             */
  Account account = accountService.register(name, email, password, role);
                     String  token   = jwtUtil.generate(account.getId(), account.getRole());

            return ResponseEntity.ok(Map.of(
                "token",     token,
                "accountId", account.getId(),
                "role",      account.getRole().toLowerCase(),
                "name",      account.getName() != null ? account.getName() : "",
                "email",     account.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }

        Optional<Account> result = accountService.authenticate(email, password);

        if (result.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        Account account = result.get();
        String  token   = jwtUtil.generate(account.getId(), account.getRole());

        return ResponseEntity.ok(Map.of(
            "token",     token,
            "accountId", account.getId(),
            "role",      account.getRole().toLowerCase(),
            "name",      account.getName() != null ? account.getName() : "",
            "email",     account.getEmail()
        ));
    }
}