package com.trading.api.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Unique login identifier (e.g. "testuser")
    @Column(unique = true)
    private String username;

    // Display name (e.g. "Test User")
    @Column
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    // Stored as 'RETAIL', 'QUANT', 'INSTITUTIONAL', or 'TRADER'
    @Column(nullable = false)
    private String role = "TRADER";

    @Column(nullable = false)
    private Double balance = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Account() {}

    // ── Getters & Setters ───────────────────────────────────────────────────

    public String  getId()                            { return id; }
    public String  getUsername()                      { return username; }
    public void    setUsername(String u)              { this.username = u; }
    public String  getName()                          { return name; }
    public void    setName(String n)                  { this.name = n; }
    public String  getEmail()                         { return email; }
    public void    setEmail(String e)                 { this.email = e; }
    public String  getPasswordHash()                  { return passwordHash; }
    public void    setPasswordHash(String ph)         { this.passwordHash = ph; }
    public String  getRole()                          { return role; }
    public void    setRole(String r)                  { this.role = r; }
    public Double  getBalance()                       { return balance; }
    public void    setBalance(Double b)               { this.balance = b; }
    public Instant getCreatedAt()                     { return createdAt; }
    public Instant getLastLogin()                     { return lastLogin; }
    public void    setLastLogin(Instant t)            { this.lastLogin = t; }
    public Boolean getIsActive()                      { return isActive; }
    public void    setIsActive(Boolean a)             { this.isActive = a; }
}