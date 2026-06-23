package com.trading.marketdata;

public class FeedNormalizer {

    public MarketEvent normalizeZerodha(String raw) {
        String[]     parts = raw.split("&");
        MarketEvent  e     = new MarketEvent();
        for (String part : parts) {
            String[] kv = part.split("=", 2);
            if (kv.length != 2) continue;
            switch (kv[0]) {
                case "symbol"    -> e.setSymbol(kv[1]);
                case "ltp"       -> e.setPrice(Double.parseDouble(kv[1]));
                case "volume"    -> e.setVolume(Long.parseLong(kv[1]));
                case "timestamp" -> e.setTimestamp(Long.parseLong(kv[1]));
                case "bid"       -> e.setBid(Double.parseDouble(kv[1]));
                case "ask"       -> e.setAsk(Double.parseDouble(kv[1]));
            }
        }
        e.setExchange("ZERODHA");
        if (e.getTimestamp() == 0) e.setTimestamp(System.currentTimeMillis());
        return e;
    }

    public MarketEvent normalizeBinance(String raw) {
        MarketEvent e = new MarketEvent();
        e.setSymbol(extractJson(raw, "s"));
        e.setPrice(Double.parseDouble(extractJson(raw, "p")));
        String qStr = extractJson(raw, "q");
        e.setVolume((long) Double.parseDouble(qStr));
        e.setTimestamp(System.currentTimeMillis());
        e.setExchange("BINANCE");
        return e;
    }

    private String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search);
        if (start == -1) return "0";
        start += search.length();
        int end = json.indexOf("\"", start);
        return end == -1 ? "0" : json.substring(start, end);
    }
}