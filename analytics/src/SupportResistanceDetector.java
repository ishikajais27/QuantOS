package com.trading.analytics;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class SupportResistanceDetector {

    // Monotonic stack — O(n) support & resistance identification
    public Map<String, List<Double>> detect(double[] prices) {
        List<Double> resistanceLevels = new ArrayList<>();
        List<Double> supportLevels   = new ArrayList<>();

        Deque<Double> stack = new ArrayDeque<>();

        // Resistance: monotonically decreasing stack of highs
        for (double price : prices) {
            while (!stack.isEmpty() && stack.peek() < price) {
                resistanceLevels.add(stack.pop()); // breakout recorded
            }
            stack.push(price);
        }
        resistanceLevels.addAll(stack);
        stack.clear();

        // Support: monotonically increasing stack of lows
        for (double price : prices) {
            while (!stack.isEmpty() && stack.peek() > price) {
                supportLevels.add(stack.pop());
            }
            stack.push(price);
        }
        supportLevels.addAll(stack);

        Map<String, List<Double>> result = new HashMap<>();
        result.put("resistance", resistanceLevels);
        result.put("support", supportLevels);
        return result;
    }

    // LIS — O(n log n) trend strength via patience sorting
    public int trendStrength(double[] prices) {
        List<Double> tails = new ArrayList<>();
        for (double price : prices) {
            int pos = Collections.binarySearch(tails, price);
            if (pos < 0) pos = -(pos + 1);
            if (pos == tails.size()) tails.add(price);
            else tails.set(pos, price);
        }
        return tails.size(); // LIS length
    }
}