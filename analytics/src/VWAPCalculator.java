package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.Deque;

import org.springframework.stereotype.Service;

@Service
public class VWAPCalculator {

    private record TradeEvent(double price, long volume, long timestamp) {}

    private final Deque<TradeEvent> window = new ArrayDeque<>();
    private final long windowMs = 30 * 60 * 1000L; // 30 minutes
    private double sumPriceVolume = 0;
    private long   sumVolume      = 0;

    // O(1) per update using sliding window deque
    public double update(double price, long volume) {
        long now = System.currentTimeMillis();
        TradeEvent event = new TradeEvent(price, volume, now);

        window.addLast(event);
        sumPriceVolume += price * volume;
        sumVolume      += volume;

        // Evict trades outside the 30-min window
        while (!window.isEmpty() && now - window.peekFirst().timestamp() > windowMs) {
            TradeEvent old = window.pollFirst();
            sumPriceVolume -= old.price() * old.volume();
            sumVolume      -= old.volume();
        }

        return sumVolume == 0 ? 0 : sumPriceVolume / sumVolume;
    }

    public double getCurrentVWAP() {
        return sumVolume == 0 ? 0 : sumPriceVolume / sumVolume;
    }
}