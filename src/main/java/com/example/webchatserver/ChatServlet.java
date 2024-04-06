package com.example.webchatserver;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Set;

@WebServlet(name = "chatServlet", value = "/chat-servlet")
public class ChatServlet extends HttpServlet {

    private static final Set<String> rooms = new HashSet<>();

    /**
     * Method generates unique room codes
     * **/
    // Generate a unique room code
    private String generatingRandomUpperAlphanumericString(int length) {
        String generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        while (rooms.contains(generatedString)) {
            generatedString = RandomStringUtils.randomAlphanumeric(length).toUpperCase();
        }
        return generatedString;
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");

        String action = request.getParameter("action");

        if ("new".equals(action)) {
            // Generate a new room code
            String roomCode = generatingRandomUpperAlphanumericString(5);
            rooms.add(roomCode);

            JSONArray jsRooms = new JSONArray();
            jsRooms.put(roomCode);

            PrintWriter out = response.getWriter();
            out.println("{\"rooms\": " + jsRooms + "}");
        } else {
            // Return existing room codes
            JSONArray jsRooms = new JSONArray();
            for (String room : rooms) {
                jsRooms.put(room);
            }

            PrintWriter out = response.getWriter();
            out.println("{\"rooms\": " + jsRooms + "}");
        }
    }
    public void destroy() {
    }
}
