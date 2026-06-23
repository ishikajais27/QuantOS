package com.trading.marketdata;

public class MarketEvent {
    private String symbol;
    private double price;
    private long   volume;
    private long   timestamp;
    private String exchange;

    // bid/ask depth for order book push
    private double bid;
    private double ask;
    private long   bidVolume;
    private long   askVolume;

    public MarketEvent() {}

    public String getSymbol()              { return symbol; }
    public void   setSymbol(String s)      { this.symbol = s; }
    public double getPrice()               { return price; }
    public void   setPrice(double p)       { this.price = p; }
    public long   getVolume()              { return volume; }
    public void   setVolume(long v)        { this.volume = v; }
    public long   getTimestamp()           { return timestamp; }
    public void   setTimestamp(long ts)    { this.timestamp = ts; }
    public String getExchange()            { return exchange; }
    public void   setExchange(String e)    { this.exchange = e; }
    public double getBid()                 { return bid; }
    public void   setBid(double bid)       { this.bid = bid; }
    public double getAsk()                 { return ask; }
    public void   setAsk(double ask)       { this.ask = ask; }
    public long   getBidVolume()           { return bidVolume; }
    public void   setBidVolume(long bv)    { this.bidVolume = bv; }
    public long   getAskVolume()           { return askVolume; }
    public void   setAskVolume(long av)    { this.askVolume = av; }

    @Override
    public String toString() {
        return exchange + " | " + symbol + " @ " + price + " vol=" + volume;
    }
}