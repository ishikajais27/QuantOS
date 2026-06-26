package com.trading.api.util;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and validates JWTs.
 * Secret is injected from environment — never hardcode in production.
 * Uses HS256 (HMAC-SHA256). For OAuth2 flows, swap to RS256.
 */
@Component
public class JwtUtil {

    private final Key    key;
    private final long   expiryMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiry:86400000}") long expiryMs) {
        // Key must be at least 256 bits for HS256
        this.key      = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiryMs = expiryMs;
    }

    public String generate(String accountId, String role) {
        return Jwts.builder()
                .setSubject(accountId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}