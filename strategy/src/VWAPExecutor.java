package com.trading.strategy;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

// VWAP execution — sizes each slice proportional to historical volume profile
@Component
public class VWAPExecutor {

    record Slice(long quantity, double targetPrice, long executeAtMs) {}

    // historicalVolumeProfile: fraction of daily volume in each time bucket
    public List<Slice> buildSchedule(long totalQuantity, double[] volumeProfile,
                                      long startMs, long bucketDurationMs) {
        List<Slice> schedule = new ArrayList<>();
        for (int i = 0; i < volumeProfile.length; i++) {
            long sliceQty = Math.round(totalQuantity * volumeProfile[i]);
            if (sliceQty == 0) continue;
            schedule.add(new Slice(sliceQty, 0.0, startMs + (long) i * bucketDurationMs));
        }
        return schedule;
    }

    public void execute(List<Slice> schedule, String instrumentId) {
        for (Slice slice : schedule) {
            long wait = slice.executeAtMs() - System.currentTimeMillis();
            if (wait > 0) {
                try { Thread.sleep(wait); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
            System.out.println("VWAP executing " + slice.quantity() + " of " + instrumentId);
            // In production: call API module to place order
        }
    }
}