
package com.trading.api;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "instruments")
public class Instrument {

    @Id
    private String id;       // e.g. NIFTY-FUT, BTCUSDT

    private String name;
    private String exchange; // NSE, BSE, BINANCE
    private String type;     // EQUITY, FUTURE, OPTION, CRYPTO
    private Double tickSize;
    private Long   lotSize;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getTickSize() { return tickSize; }
    public void setTickSize(Double tickSize) { this.tickSize = tickSize; }
    public Long getLotSize() { return lotSize; }
    public void setLotSize(Long lotSize) { this.lotSize = lotSize; }
}