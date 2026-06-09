package com.trading.api;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trades")
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
    private BigDecimal price;     // BigDecimal avoids floating-point errors

    private Long quantity;

    private Instant tradedAt = Instant.now();

    public String getId() { return id; }
    public String getInstrumentId() { return instrumentId; }
    public void setInstrumentId(String instrumentId) { this.instrumentId = instrumentId; }
    public String getBuyAccountId() { return buyAccountId; }
    public void setBuyAccountId(String buyAccountId) { this.buyAccountId = buyAccountId; }
    public String getSellAccountId() { return sellAccountId; }
    public void setSellAccountId(String sellAccountId) { this.sellAccountId = sellAccountId; }
    public String getBuyOrderId() { return buyOrderId; }
    public void setBuyOrderId(String buyOrderId) { this.buyOrderId = buyOrderId; }
    public String getSellOrderId() { return sellOrderId; }
    public void setSellOrderId(String sellOrderId) { this.sellOrderId = sellOrderId; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Long getQuantity() { return quantity; }
    public void setQuantity(Long quantity) { this.quantity = quantity; }
    public Instant getTradedAt() { return tradedAt; }
}