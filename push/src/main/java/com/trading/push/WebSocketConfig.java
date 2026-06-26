package com.trading.push;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Registers the /ws endpoint with SockJS fallback.
     *
     * nginx proxies /ws and /ws/ to this service (push:8084).
     * The frontend lib/websocket.ts connects via:
     *   new SockJS('/ws')  →  nginx  →  push:8084/ws
     *
     * setAllowedOriginPatterns("*") is intentionally permissive for this demo.
     * In production, replace with the exact frontend origin.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configures the in-memory STOMP message broker.
     *
     * enableSimpleBroker("/topic") → activates destinations like /topic/NIFTY-FUT
     *
     * Frontend subscribes to:  /topic/NIFTY-FUT
     * MarketDataRelay sends to: /topic/NIFTY-FUT  (stripped from "market:NIFTY-FUT")
     *
     * setApplicationDestinationPrefixes("/app") → routes @MessageMapping methods
     * (not used here but registered for future @MessageMapping endpoints).
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}