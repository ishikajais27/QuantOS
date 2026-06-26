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
        String role     = body.getOrDefault("role", "TRADER");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }
        Account account = accountService.register(email, password, role);
        String  token   = jwtUtil.generate(account.getId(), account.getRole());
        return ResponseEntity.ok(Map.of("token", token, "accountId", account.getId(), "role", account.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        if (!accountService.authenticate(email, password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        Account account = accountService.getByEmail(email);
        String  token   = jwtUtil.generate(account.getId(), account.getRole());
        return ResponseEntity.ok(Map.of("token", token, "accountId", account.getId(), "role", account.getRole()));
    }
}