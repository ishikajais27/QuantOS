package marketdata;
public class FeedNormalizer {

    public MarketEvent normalizeZerodha(String raw) {
        String[] parts = raw.split("&");
        MarketEvent e = new MarketEvent();
        for (String part : parts) {
            String[] kv = part.split("=");
            switch (kv[0]) {
                case "symbol"    -> e.setSymbol(kv[1]);
                case "ltp"       -> e.setPrice(Double.parseDouble(kv[1]));
                case "volume"    -> e.setVolume(Long.parseLong(kv[1]));
                case "timestamp" -> e.setTimestamp(Long.parseLong(kv[1]));
            }
        }
        e.setExchange("ZERODHA");
        return e;
    }

    public MarketEvent normalizeBinance(String raw) {
        MarketEvent e = new MarketEvent();
        e.setSymbol(extractJson(raw, "s"));
        e.setPrice(Double.parseDouble(extractJson(raw, "p")));
        e.setVolume((long) Double.parseDouble(extractJson(raw, "q")));
        e.setTimestamp(System.currentTimeMillis());
        e.setExchange("BINANCE");
        return e;
    }

    private String extractJson(String json, String key) {
        String search = "\"" + key + "\":\"";
        int start = json.indexOf(search) + search.length();
        int end = json.indexOf("\"", start);
        return json.substring(start, end);
    }
}