package com.trading.api.entity;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "trades", indexes = {
    @Index(name = "idx_trade_instrument_time", columnList = "instrumentId, tradedAt DESC")
})
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String instrumentId;
    private String buyAccountId;
    private String sellAccountId;
    private String buyOrderId;
    private String sellOrderId;

    @Column(precision = 20, scale = 8)
    private BigDecimal price;

    private Long    quantity;
    private Instant tradedAt = Instant.now();

    public Trade() {}

    public String     getId()                          { return id; }
    public String     getInstrumentId()                { return instrumentId; }
    public void       setInstrumentId(String i)        { this.instrumentId = i; }
    public String     getBuyAccountId()                { return buyAccountId; }
    public void       setBuyAccountId(String a)        { this.buyAccountId = a; }
    public String     getSellAccountId()               { return sellAccountId; }
    public void       setSellAccountId(String a)       { this.sellAccountId = a; }
    public String     getBuyOrderId()                  { return buyOrderId; }
    public void       setBuyOrderId(String o)          { this.buyOrderId = o; }
    public String     getSellOrderId()                 { return sellOrderId; }
    public void       setSellOrderId(String o)         { this.sellOrderId = o; }
    public BigDecimal getPrice()                       { return price; }
    public void       setPrice(BigDecimal price)       { this.price = price; }
    public Long       getQuantity()                    { return quantity; }
    public void       setQuantity(Long quantity)       { this.quantity = quantity; }
    public Instant    getTradedAt()                    { return tradedAt; }
}