package com.trading.engine;
import java.util.PriorityQueue;

public class OrderBook {

    private final PriorityQueue<Order> bids = new PriorityQueue<>((a, b) -> {
        int cmp = Double.compare(b.getPrice(), a.getPrice());
        return cmp != 0 ? cmp : Long.compare(a.getTimestamp(), b.getTimestamp());
    });

    private final PriorityQueue<Order> asks = new PriorityQueue<>((a, b) -> {
        int cmp = Double.compare(a.getPrice(), b.getPrice());
        return cmp != 0 ? cmp : Long.compare(a.getTimestamp(), b.getTimestamp());
    });

    public void add(Order order) {
        if ("BID".equalsIgnoreCase(order.getType())) bids.add(order);
        else asks.add(order);
    }

    public void remove(Order order) {
        if ("BID".equalsIgnoreCase(order.getType())) bids.remove(order);
        else asks.remove(order);
    }

    public Order peekBid()  { return bids.peek(); }
    public Order peekAsk()  { return asks.peek(); }
    public Order pollBid()  { return bids.poll(); }
    public Order pollAsk()  { return asks.poll(); }
    public boolean hasBid() { return !bids.isEmpty(); }
    public boolean hasAsk() { return !asks.isEmpty(); }

    public double getSpread() {
        if (hasBid() && hasAsk())
            return asks.peek().getPrice() - bids.peek().getPrice();
        return -1;
    }
}