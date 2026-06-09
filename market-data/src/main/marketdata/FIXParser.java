package marketdata;


import java.util.HashMap;
import java.util.Map;

public class FIXParser {

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        String value = null;
    }

    private final TrieNode root = new TrieNode();

    public Map<String, String> parse(String message) {
        Map<String, String> tags = new HashMap<>();
        String[] pairs = message.split("\\|");
        for (String pair : pairs) {
            if (pair.isEmpty()) continue;
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                insert(kv[0], kv[1]);
                tags.put(kv[0], kv[1]);
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

    public String lookup(String tag) {
        TrieNode node = root;
        for (char c : tag.toCharArray()) {
            if (!node.children.containsKey(c)) return null;
            node = node.children.get(c);
        }
        return node.value;
    }
}