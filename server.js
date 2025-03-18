const WebSocket = require("ws");

// Lắng nghe trên 0.0.0.0 để chấp nhận kết nối từ bất kỳ IP nào
const server = new WebSocket.Server({ host: "0.0.0.0", port: 4000 });

// Cấu trúc lưu trữ thông tin phòng và người dùng
const rooms = new Map(); // Map<roomId, Map<username, WebSocket>>
const clients = new Map(); // Map<WebSocket, {username, roomId}>

function handleError(ws, error, message) {
    console.error(`❌ ${message}:`, error);
    ws.send(JSON.stringify({
        type: "error",
        message: message
    }));
}

function broadcastToRoom(roomId, message, exclude = null) {
    if (!rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    room.forEach((clientWs, clientUsername) => {
        if (clientWs !== exclude && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify(message));
        }
    });
}

function getRoomParticipants(roomId) {
    if (!rooms.has(roomId)) return [];
    return Array.from(rooms.get(roomId).keys());
}

function leaveRoom(ws) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;

    const { username, roomId } = clientInfo;
    if (!rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.delete(username);

    // Thông báo cho những người còn lại trong phòng
    broadcastToRoom(roomId, {
        type: "user-left",
        username,
        participants: getRoomParticipants(roomId)
    });

    // Xóa phòng nếu không còn ai
    if (room.size === 0) {
        rooms.delete(roomId);
    }

    clients.delete(ws);
    console.log(`👋 ${username} đã rời phòng ${roomId}`);
}

server.on("connection", (ws) => {
    console.log("🔌 Có kết nối mới");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case "join-room": {
                    const { username, roomId } = data;
                    
                    // Tạo phòng mới nếu chưa tồn tại
                    if (!rooms.has(roomId)) {
                        rooms.set(roomId, new Map());
                    }
                    
                    const room = rooms.get(roomId);
                    
                    // Kiểm tra xem username đã tồn tại trong phòng chưa
                    if (room.has(username)) {
                        return;
                    }

                    // Thêm người dùng vào phòng
                    room.set(username, ws);
                    clients.set(ws, { username, roomId });

                    // Gửi danh sách người trong phòng cho người mới
                    ws.send(JSON.stringify({
                        type: "room-info",
                        participants: getRoomParticipants(roomId)
                    }));

                    // Thông báo cho mọi người về người mới
                    broadcastToRoom(roomId, {
                        type: "user-joined",
                        username,
                        participants: getRoomParticipants(roomId)
                    }, ws);

                    console.log(`✅ ${username} đã vào phòng ${roomId}`);
                    break;
                }

                case "offer":
                case "answer":
                case "ice-candidate": {
                    const clientInfo = clients.get(ws);
                    if (!clientInfo) return;

                    const { roomId } = clientInfo;
                    const room = rooms.get(roomId);
                    if (!room || !data.target) return;

                    const targetWs = room.get(data.target);
                    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                        targetWs.send(JSON.stringify({
                            ...data,
                            from: clientInfo.username
                        }));
                    }
                    break;
                }

                case "chat-message": {
                    const clientInfo = clients.get(ws);
                    if (!clientInfo) return;

                    broadcastToRoom(clientInfo.roomId, {
                        type: "chat-message",
                        from: clientInfo.username,
                        message: data.message,
                        timestamp: Date.now()
                    });
                    break;
                }
            }
        } catch (error) {
            handleError(ws, error, "Lỗi xử lý tin nhắn");
        }
    });

    ws.on("close", () => {
        leaveRoom(ws);
    });

    ws.on("error", (error) => {
        handleError(ws, error, "Lỗi WebSocket");
        leaveRoom(ws);
    });
});

// 🛠️ In ra URL Ngrok WebSocket để dễ kết nối
console.log("🚀 Server WebSocket đang chạy tại:");
console.log("➡️  ws://localhost:4000 (Local)");
console.log("➡️  ws://<NGROK_URL> (Public - Cập nhật URL từ Ngrok)");
