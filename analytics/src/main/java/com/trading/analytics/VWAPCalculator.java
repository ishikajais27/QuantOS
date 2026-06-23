package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.Deque;

import org.springframework.stereotype.Service;

/**
 * Sliding 30-minute VWAP using an ArrayDeque.
 * Each update is O(1) amortized.
 */
@Service
public class VWAPCalculator {

    private record TradeEvent(double price, long volume, long timestamp) {}

    private final Deque<TradeEvent> window    = new ArrayDeque<>();
    private final long              windowMs  = 30L * 60 * 1000; // 30 min
    private double                  sumPV     = 0.0;
    private long                    sumVol    = 0L;

    public synchronized double update(double price, long volume) {
        long now   = System.currentTimeMillis();
        TradeEvent e = new TradeEvent(price, volume, now);
        window.addLast(e);
        sumPV  += price * volume;
        sumVol += volume;

        // Evict stale events
        while (!window.isEmpty() && now - window.peekFirst().timestamp() > windowMs) {
            TradeEvent old = window.pollFirst();
            sumPV  -= old.price()  * old.volume();
            sumVol -= old.volume();
        }
        return sumVol == 0 ? 0.0 : sumPV / sumVol;
    }

    public synchronized double getCurrentVWAP() {
        return sumVol == 0 ? 0.0 : sumPV / sumVol;
    }

    public synchronized int windowSize() { return window.size(); }
}