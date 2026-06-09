package com.trading.push;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    // Room-based subscriptions: instrument -> set of sessions
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), session);
        System.out.println("Client connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Expected: {"action":"subscribe","instrument":"NIFTY-FUT"}
        String payload = message.getPayload();
        if (payload.contains("subscribe")) {
            String instrument = extractInstrument(payload);
            rooms.computeIfAbsent(instrument, k -> ConcurrentHashMap.newKeySet())
                 .add(session);
            System.out.println(session.getId() + " subscribed to " + instrument);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        rooms.values().forEach(set -> set.remove(session));
    }

    public void broadcast(String instrument, String data) {
        Set<WebSocketSession> subscribers = rooms.getOrDefault(instrument, Set.of());
        for (WebSocketSession s : subscribers) {
            if (s.isOpen()) {
                try { s.sendMessage(new TextMessage(data)); }
                catch (IOException e) { System.err.println("Send failed: " + e.getMessage()); }
            }
        }
    }

    private String extractInstrument(String json) {
        int start = json.indexOf("\"instrument\":\"") + 14;
        int end   = json.indexOf("\"", start);
        return json.substring(start, end);
    }
}