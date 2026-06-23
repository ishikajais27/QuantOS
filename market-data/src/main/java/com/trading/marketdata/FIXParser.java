package com.trading.marketdata;

import java.util.HashMap;
import java.util.Map;

public class FIXParser {

    private static class TrieNode {
        final Map<Character, TrieNode> children = new HashMap<>();
        String value = null;
    }

    private final TrieNode root = new TrieNode();

    /** Parse a FIX message: "8=FIX.4.4|35=D|49=SENDER|55=RELIANCE|44=2850.5|38=100|" */
    public Map<String, String> parse(String message) {
        Map<String, String> tags = new HashMap<>();
        String[] pairs = message.split("\\|");
        for (String pair : pairs) {
            if (pair.isBlank()) continue;
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                insert(kv[0].trim(), kv[1].trim());
                tags.put(kv[0].trim(), kv[1].trim());
            }
        }
        return tags;
    }

    private void insert(String tag, String value) {
        TrieNode node = root;
        for (char c : tag.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.value = value;
    }

    /** O(len(tag)) lookup */
    public String lookup(String tag) {
        TrieNode node = root;
        for (char c : tag.toCharArray()) {
            if (!node.children.containsKey(c)) return null;
            node = node.children.get(c);
        }
        return node.value;
    }

    public void clear() {
        root.children.clear();
    }
}