package com.trading.api.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private String instrumentId;

    @Column(nullable = false)
    private String type;   // BID or ASK

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Long quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    private Instant createdAt = Instant.now();

    public enum OrderStatus { PENDING, MATCHED, CANCELLED }

    public Order() {}

    public String      getId()                           { return id; }
    public void        setId(String id)                  { this.id = id; }
    public String      getAccountId()                    { return accountId; }
    public void        setAccountId(String a)            { this.accountId = a; }
    public String      getInstrumentId()                 { return instrumentId; }
    public void        setInstrumentId(String i)         { this.instrumentId = i; }
    public String      getType()                         { return type; }
    public void        setType(String type)              { this.type = type; }
    public Double      getPrice()                        { return price; }
    public void        setPrice(Double price)            { this.price = price; }
    public Long        getQuantity()                     { return quantity; }
    public void        setQuantity(Long quantity)        { this.quantity = quantity; }
    public OrderStatus getStatus()                       { return status; }
    public void        setStatus(OrderStatus status)     { this.status = status; }
    public Instant     getCreatedAt()                    { return createdAt; }
}