package com.trading.strategy;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Service
@RestController
@RequestMapping("/strategy")
public class StrategyExecutor {

    private final TWAPExecutor twapExecutor;
    private final VWAPExecutor vwapExecutor;
    private final SmartOrderRouter router;

    public StrategyExecutor(TWAPExecutor twapExecutor,
                             VWAPExecutor vwapExecutor,
                             SmartOrderRouter router) {
        this.twapExecutor = twapExecutor;
        this.vwapExecutor = vwapExecutor;
        this.router       = router;
    }

    @PostMapping("/twap")
    public String executeTWAP(@RequestParam String instrumentId,
                               @RequestParam long quantity,
                               @RequestParam long durationMs,
                               @RequestParam int slices) {
        List<TWAPExecutor.Slice> schedule = twapExecutor.buildSchedule(quantity, durationMs, slices);
        new Thread(() -> twapExecutor.execute(schedule, instrumentId)).start();
        return "TWAP started: " + slices + " slices over " + durationMs + "ms";
    }

    @PostMapping("/vwap")
    public String executeVWAP(@RequestParam String instrumentId,
                               @RequestParam long quantity) {
        double[] profile = {0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05}; // 8 buckets
        List<VWAPExecutor.Slice> schedule = vwapExecutor.buildSchedule(
            quantity, profile, System.currentTimeMillis(), 30_000
        );
        new Thread(() -> vwapExecutor.execute(schedule, instrumentId)).start();
        return "VWAP started for " + instrumentId;
    }

    @GetMapping("/route")
    public List<String> getBestRoute(@RequestParam String from,
                                      @RequestParam String to,
                                      @RequestParam long quantity) {
        return router.route(from, to, quantity);
    }
}