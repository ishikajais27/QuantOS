package com.trading.push;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisConfig {

    /**
     * Creates the Redis Pub/Sub subscriber container.
     *
     * Spring injects:
     *   connectionFactory  → from auto-configured Lettuce/Jedis (reads application.yml)
     *   marketDataRelay    → our @Component above (only needs SimpMessagingTemplate)
     *
     * No cycle: RedisConfig needs MarketDataRelay, MarketDataRelay does NOT need
     * anything from RedisConfig. Clean one-directional dependency.
     *
     * PatternTopic("market:*") → Redis PSUBSCRIBE market:*
     * Catches: market:NIFTY-FUT, market:BTCUSDT, market:BANKNIFTY, etc.
     * Any new instrument published by market-data is automatically relayed
     * without any config change here.
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MarketDataRelay marketDataRelay) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(marketDataRelay, new PatternTopic("market:*"));
        return container;
    }
}