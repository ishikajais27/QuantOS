package marketdata;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MarketDataService {

    private final FeedNormalizer normalizer = new FeedNormalizer();
    private final FIXParser fixParser = new FIXParser();

    @Scheduled(fixedDelay = 1000)
    public void consumeFeeds() {
        String rawZerodhaFeed = "symbol=NIFTY&ltp=22450.5&volume=12345&timestamp=1700000000";
        String rawBinanceFeed = "{\"s\":\"BTCUSDT\",\"p\":\"42000.00\",\"q\":\"1.5\"}";
        String rawFIXMessage  = "8=FIX.4.4|35=D|49=SENDER|56=TARGET|55=RELIANCE|44=2850.5|38=100|";

        MarketEvent zerodhaEvent = normalizer.normalizeZerodha(rawZerodhaFeed);
        MarketEvent binanceEvent = normalizer.normalizeBinance(rawBinanceFeed);
        Map<String, String> fixTags = fixParser.parse(rawFIXMessage);

        System.out.println("Zerodha: " + zerodhaEvent);
        System.out.println("Binance: " + binanceEvent);
        System.out.println("FIX parsed tag 55 (symbol): " + fixTags.get("55"));
    }

    public void handleGap(String exchange, long lastSeq, long currentSeq) {
        if (currentSeq - lastSeq > 1) {
            System.out.println("Gap detected on " + exchange +
                " from " + lastSeq + " to " + currentSeq + " — reconnecting");
        }
    }
}