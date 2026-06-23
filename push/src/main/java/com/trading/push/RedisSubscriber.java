package com.trading.push;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisSubscriber {

    private static final Logger log = LoggerFactory.getLogger(RedisSubscriber.class);

    @Bean
    public RedisMessageListenerContainer redisListenerContainer(
            RedisConnectionFactory factory,
            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        container.addMessageListener(listenerAdapter, new PatternTopic("market:*"));
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter(MarketDataPushService pushService) {
        return new MessageListenerAdapter(pushService, "onMessage");
    }
}