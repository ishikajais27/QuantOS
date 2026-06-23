package com.trading.engine;

import java.util.PriorityQueue;

public class OrderBook {

    // Bids: max-heap — highest price first, then earliest timestamp
    private final PriorityQueue<Order> bids = new PriorityQueue<>((a, b) -> {
        int cmp = Double.compare(b.getPrice(), a.getPrice());
        return cmp != 0 ? cmp : Long.compare(a.getTimestamp(), b.getTimestamp());
    });

    // Asks: min-heap — lowest price first, then earliest timestamp
    private final PriorityQueue<Order> asks = new PriorityQueue<>((a, b) -> {
        int cmp = Double.compare(a.getPrice(), b.getPrice());
        return cmp != 0 ? cmp : Long.compare(a.getTimestamp(), b.getTimestamp());
    });

    public void add(Order order) {
        if ("BID".equalsIgnoreCase(order.getType())) bids.add(order);
        else asks.add(order);
    }

    public boolean remove(Order order) {
        if ("BID".equalsIgnoreCase(order.getType())) return bids.remove(order);
        else return asks.remove(order);
    }

    public Order peekBid()  { return bids.peek(); }
    public Order peekAsk()  { return asks.peek(); }
    public Order pollBid()  { return bids.poll(); }
    public Order pollAsk()  { return asks.poll(); }
    public boolean hasBid() { return !bids.isEmpty(); }
    public boolean hasAsk() { return !asks.isEmpty(); }

    public int bidDepth() { return bids.size(); }
    public int askDepth() { return asks.size(); }

    public double getSpread() {
        if (hasBid() && hasAsk())
            return asks.peek().getPrice() - bids.peek().getPrice();
        return -1;
    }

    public double getBestBid() { return hasBid() ? bids.peek().getPrice() : 0; }
    public double getBestAsk() { return hasAsk() ? asks.peek().getPrice() : 0; }
}