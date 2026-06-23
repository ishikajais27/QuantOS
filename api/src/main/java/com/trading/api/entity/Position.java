package com.trading.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "positions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"accountId","instrumentId"}))
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private String instrumentId;

    private Long   quantity;
    private Double averagePrice;
    private Double unrealizedPnl = 0.0;

    public Position() {}

    public String getId()                            { return id; }
    public String getAccountId()                     { return accountId; }
    public void   setAccountId(String a)             { this.accountId = a; }
    public String getInstrumentId()                  { return instrumentId; }
    public void   setInstrumentId(String i)          { this.instrumentId = i; }
    public Long   getQuantity()                      { return quantity; }
    public void   setQuantity(Long q)                { this.quantity = q; }
    public Double getAveragePrice()                  { return averagePrice; }
    public void   setAveragePrice(Double ap)         { this.averagePrice = ap; }
    public Double getUnrealizedPnl()                 { return unrealizedPnl; }
    public void   setUnrealizedPnl(Double pnl)       { this.unrealizedPnl = pnl; }
}