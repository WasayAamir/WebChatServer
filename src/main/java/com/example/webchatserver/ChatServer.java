package com.example.webchatserver;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

//import static com.example.util.ChatAPIHandler.loadChatRoomHistory;
//import static com.example.util.ChatAPIHandler.saveChatRoomHistory;

@ServerEndpoint(value="/ws/{roomId}")
public class ChatServer {

    private Map<String, String> usernames = new HashMap<String, String>();
    private static Map<String, String> roomList = new HashMap<String, String>();
    private static Map<String, String> roomHistoryList = new HashMap<String, String>();

    @OnOpen
    public void open(@PathParam("roomId") String roomId, Session session) throws IOException {
        roomList.put(session.getId(), roomId); // adding userID to a room


        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to chat room " + roomId + " Please state your username to begin.\"}");
    }

    @OnClose
    public void close(Session session) throws IOException {
        String userId = session.getId();
        if (usernames.containsKey(userId)) {
            String username = usernames.get(userId);
            usernames.remove(userId);
            String roomID = roomList.get(userId);
            roomList.remove(roomID);


            //broadcast this person left the server
            int countPeers = 0;
            for (Session peer : session.getOpenSessions()){
                // only broadcast messages to those in the same room
                if(roomList.get(peer.getId()).equals(roomID)) {
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room.\"}");
                    countPeers++;
                }
            }
        }
    }
    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException {
        String userID = session.getId();
        String roomID = roomList.get(userID);
        JSONObject jsonmsg = new JSONObject(comm);
        String type = (String) jsonmsg.get("type");
        String message = (String) jsonmsg.get("msg");

        // not their first message
        if (usernames.containsKey(userID)) {
            String username = usernames.get(userID);
            System.out.println(username);

            for (Session peer : session.getOpenSessions()) {
                // only broadcast messages to those in the same room
                if (roomList.get(peer.getId()).equals(roomID)) {
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + "): " + message + "\"}");
                }
            }
        } else { //first message is their username
            usernames.put(userID, message);
            session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome, " + message + "!\"}");

            //broadcast this person joined the server to the rest
            for (Session peer : session.getOpenSessions()) {
                if ((!peer.getId().equals(userID)) && (roomList.get(peer.getId()).equals(roomID))) {
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + message + " joined the chat room.\"}");
                }
            }
        }
    }

}