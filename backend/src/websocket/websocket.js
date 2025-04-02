import { WebSocketServer } from "ws";
import { handleChatMessage, handleJoinMeeting, handleWebRTCSignaling, handleleaveMeeting } from "./meetingHandler.js";
import { handleError } from "./errorHandler.js";


export function initWebSocket(server) {
    const meetings = new Map(); // Map<meetingId, Map<username, WebSocket>>
    const clients = new Map(); // Map<WebSocket, {username, meetingId}>
    
    const wssServer = new WebSocketServer({ server });
    wssServer.on("connection", (ws) => {
        console.log("New client connected");
    
        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
    
                switch (data.type) {
                    case "join-room": 
                        handleJoinMeeting(clients, meetings, ws, data);
                        break;

                    case "offer":
                    case "answer":
                    case "ice-candidate": 
                        handleWebRTCSignaling(clients, meetings, ws, data);
                        break;
                    
    
                    case "chat-message":
                        handleChatMessage(clients, meetings, ws, data);
                        break;
                }
            } catch (error) {
                handleError(ws, error, "Error parsing message");
            }
        });
    
        ws.on("close", () => handleleaveMeeting(clients, meetings, ws));
        ws.on("error", (error) => handleError(ws, error, "WebSocket error"));
    });

}