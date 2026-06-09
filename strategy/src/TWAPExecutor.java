package com.trading.strategy;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

// Time-Weighted Average Price execution — splits order evenly over time
@Component
public class TWAPExecutor {

    record Slice(long quantity, long executeAtMs) {}

    public List<Slice> buildSchedule(long totalQuantity, long durationMs, int numSlices) {
        long sliceQty = totalQuantity / numSlices;
        long interval = durationMs / numSlices;
        long now = System.currentTimeMillis();

        List<Slice> schedule = new ArrayList<>();
        for (int i = 0; i < numSlices; i++) {
            long qty = (i == numSlices - 1)
                ? totalQuantity - (sliceQty * (numSlices - 1)) // remainder in last slice
                : sliceQty;
            schedule.add(new Slice(qty, now + (long) i * interval));
        }
        return schedule;
    }

    public void execute(List<Slice> schedule, String instrumentId) {
        for (Slice slice : schedule) {
            long wait = slice.executeAtMs() - System.currentTimeMillis();
            if (wait > 0) {
                try { Thread.sleep(wait); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
            System.out.println("TWAP executing " + slice.quantity() + " of " + instrumentId);
            // In production: call API module to place order
        }
    }
}