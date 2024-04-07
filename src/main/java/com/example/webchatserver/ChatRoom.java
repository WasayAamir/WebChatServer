package com.example.webchatserver;

import jakarta.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ChatRoom {
    private String roomId;
    private Map<String, String> users = new ConcurrentHashMap<>();
    private Map<String, Session> sessions = new ConcurrentHashMap<>();

    public ChatRoom(String roomId) {
        this.roomId = roomId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void addSession(Session session) {
        users.put(session.getId(), "");
        sessions.put(session.getId(), session);
    }

    public void removeUser(String sessionId) {
        String username = users.get(sessionId);
        users.remove(sessionId);
        sessions.remove(sessionId);
    }

    public boolean isEmpty() {
        return users.isEmpty();
    }

    public boolean containsUser(String sessionId) {
        return users.containsKey(sessionId);
    }

    public void setUsername(String sessionId, String username) {
        users.put(sessionId, username);
    }

    public String getUsername(String sessionId) {
        return users.get(sessionId);
    }

    public void broadcast(String message) throws IOException {
        for (Session session : sessions.values()) {
            session.getBasicRemote().sendText(message);
        }
    }
}
