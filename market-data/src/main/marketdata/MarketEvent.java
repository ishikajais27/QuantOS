package marketdata;


public class MarketEvent {
    private String symbol;
    private double price;
    private long volume;
    private long timestamp;
    private String exchange;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }

    @Override
    public String toString() {
        return exchange + " | " + symbol + " @ " + price + " vol=" + volume;
    }
}