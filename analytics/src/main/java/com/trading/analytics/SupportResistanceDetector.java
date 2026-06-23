package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class SupportResistanceDetector {

    /**
     * Monotonic stack approach — O(n).
     * Resistance: prices that were broken upward (stack of decreasing highs).
     * Support:    prices that were broken downward (stack of increasing lows).
     */
    public Map<String, List<Double>> detect(double[] prices) {
        List<Double> resistance = new ArrayList<>();
        List<Double> support    = new ArrayList<>();
        Deque<Double> stack     = new ArrayDeque<>();

        // Resistance — decreasing monotonic stack
        for (double price : prices) {
            while (!stack.isEmpty() && stack.peek() < price) {
                resistance.add(stack.pop());
            }
            stack.push(price);
        }
        resistance.addAll(stack);
        stack.clear();

        // Support — increasing monotonic stack
        for (double price : prices) {
            while (!stack.isEmpty() && stack.peek() > price) {
                support.add(stack.pop());
            }
            stack.push(price);
        }
        support.addAll(stack);

        Map<String, List<Double>> result = new LinkedHashMap<>();
        result.put("resistance", resistance);
        result.put("support", support);
        return result;
    }

    /**
     * LIS via patience sorting — O(n log n).
     * Longer LIS → stronger uptrend.
     */
    public int trendStrength(double[] prices) {
        List<Double> tails = new ArrayList<>();
        for (double price : prices) {
            int pos = Collections.binarySearch(tails, price);
            if (pos < 0) pos = -(pos + 1);
            if (pos == tails.size()) tails.add(price);
            else tails.set(pos, price);
        }
        return tails.size();
    }
}