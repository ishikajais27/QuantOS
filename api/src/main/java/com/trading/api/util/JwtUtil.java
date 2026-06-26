package com.trading.api.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key   key;
    private final long  expiryMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiry:86400000}") long expiryMs) {
        // Key must be at least 256 bits for HS256
        this.key      = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiryMs = expiryMs;
    }

    /** Generate a JWT containing accountId (subject), role, and display name. */
    public String generate(String accountId, String role, String name) {
        return Jwts.builder()
                .setSubject(accountId)
                .claim("role", role)
                .claim("name", name != null ? name : "")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Overload for backward compatibility */
    public String generate(String accountId, String role) {
        return generate(accountId, role, "");
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