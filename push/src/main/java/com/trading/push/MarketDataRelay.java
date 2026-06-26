package com.trading.push;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * CIRCULAR REFERENCE ROOT CAUSE (what was wrong):
 *
 * The previous MarketDataRelay had 3 constructor parameters:
 *   param 0 → SimpMessagingTemplate
 *   param 1 → StringRedisTemplate
 *   param 2 → RedisMessageListenerContainer   ← THE PROBLEM
 *
 * Spring tried to create MarketDataRelay, needed RedisMessageListenerContainer,
 * started creating RedisMessageListenerContainer (in RedisConfig),
 * which needed MarketDataRelay (still being created) → CYCLE → crash.
 *
 * FIX: MarketDataRelay only needs SimpMessagingTemplate.
 * RedisConfig registers this bean INTO the container — MarketDataRelay
 * does NOT need to know about the container at all.
 *
 * Dependency graph AFTER fix (no cycle):
 *   SimpMessagingTemplate ──► MarketDataRelay (implements MessageListener)
 *   RedisConnectionFactory ─┐
 *   MarketDataRelay ────────┴► RedisMessageListenerContainer (created by RedisConfig)
 */
@Component
public class MarketDataRelay implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(MarketDataRelay.class);

    // ONE dependency only — SimpMessagingTemplate is created by Spring WebSocket
    // infrastructure, has no dependency on Redis beans → zero risk of cycle
    private final SimpMessagingTemplate stompTemplate;

    public MarketDataRelay(SimpMessagingTemplate stompTemplate) {
        this.stompTemplate = stompTemplate;
    }

    /**
     * Called by RedisMessageListenerContainer on every Redis PUBLISH event
     * matching the pattern "market:*" (registered in RedisConfig).
     *
     * Flow:
     *   Redis PUBLISH market:NIFTY-FUT <json>
     *     → container thread calls onMessage()
     *       → extract instrument from channel name
     *         → stompTemplate broadcasts to /topic/NIFTY-FUT
     *           → all subscribed WebSocket clients receive the JSON
     *
     * @param message  getChannel() = "market:NIFTY-FUT", getBody() = JSON payload
     * @param pattern  matched pattern bytes ("market:*") — used only for debug log
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = null;
        try {
            channel        = new String(message.getChannel());  // "market:NIFTY-FUT"
            String payload = new String(message.getBody());     // full JSON order book

            // Strip prefix: "market:NIFTY-FUT" → "NIFTY-FUT"
            String instrument = channel.replace("market:", "");

            // Broadcast to all STOMP clients subscribed to /topic/NIFTY-FUT
            String topic = "/topic/" + instrument;
            stompTemplate.convertAndSend(topic, payload);

            log.debug("Redis [{}] → STOMP [{}] ({} bytes)", channel, topic, payload.length());

        } catch (Exception e) {
            log.error("Relay failed from channel [{}]: {}",
                      channel != null ? channel : "unknown", e.getMessage(), e);
        }
    }
}