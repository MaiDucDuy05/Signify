import { WebSocketServer } from "ws";
import { initDB, User, Meeting, MeetingUser, Message } from "./src/postgres/index.js";




// Khởi tạo kết nối database
(async () => {
    await initDB();
    console.log("Database initialized");
})();

// Lắng nghe trên 0.0.0.0 để chấp nhận kết nối từ bất kỳ IP nào
const server = new WebSocketServer({ host: "0.0.0.0", port: 4000 });

// Cấu trúc lưu trữ thông tin phòng và người dùng
const meetings = new Map(); // Map<meetingId, Map<username, WebSocket>>
const clients = new Map(); // Map<WebSocket, {username, meetingId}>

function handleError(ws, error, message) {
    console.error(`❌ ${message}:`, error);
    ws.send(JSON.stringify({
        type: "error",
        message: message
    }));
}

function broadcastToMeeting(meetingId, message, exclude = null) {
    if (!meetings.has(meetingId)) return;
    meetings.get(meetingId).forEach((clientWs, clientUsername) => {
        if (clientWs !== exclude && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify(message));
        }
    });
}


async function leaveMeeting(ws) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;

    const { username, meetingId } = clientInfo;
    if (!meetings.has(meetingId)) return;

    const meeting = meetings.get(meetingId);
    meeting.delete(username);

    const user = await User.findOne({ where: { name: username } });
    if (user) {
        await MeetingUser.update({ leavedAt: new Date() }, { 
            where: { userId: user.id, meetingId }
        });
    }

    broadcastToMeeting(meetingId, { type: "user-left", username });

    if (meeting.size === 0) meetings.delete(meetingId);

    clients.delete(ws);
    console.log(`👋 ${username} đã rời cuộc họp ${meetingId}`);
}

server.on("connection", (ws) => {
    console.log("🔌 Có kết nối mới");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "join-room": {
                    const { username, meetingId } = data;
                    
                    // Tạo phòng mới nếu chưa tồn tại
                    if (!meetings.has(meetingId)) meetings.set(meetingId, new Map());
                    const meeting = meetings.get(meetingId);
                    
                    // Kiểm tra xem username đã tồn tại trong phòng chưa
                    if (meeting.has(username)) return;

                    // Thêm người dùng vào phòng
                    meeting.set(username, ws);
                    clients.set(ws, { username, meetingId });

                    let meetingRecord = await Meeting.findByPk(meetingId);
                    if (!meetingRecord) {
                        meetingRecord = await Meeting.create({ id: meetingId, status: "active" });
                    }

                    let userRecord = await User.findOne({ where: { name: username } });
                    if (!userRecord) {
                        userRecord = await User.create({ name: username });
                    }

                    await MeetingUser.create({
                        userId: userRecord.id,
                        meetingId: meetingId,
                        joinedAt: new Date(),
                    });

                    // Gửi danh sách người trong phòng cho người mới
                    ws.send(JSON.stringify({
                        type: "meeting-info",
                        participants: Array.from(meeting.keys()),
                    }));

                    // Thông báo cho mọi người về người mới
                    broadcastToMeeting(meetingId, {
                        type: "user-joined",
                        username,
                        participants: Array.from(meeting.keys()),
                    }, ws);

                    console.log(`✅ ${username} đã vào cuộc họp ${meetingId}`);
                    break;
                }

                case "offer":
                case "answer":
                    case "ice-candidate": {
                        const clientInfo = clients.get(ws);
                        if (!clientInfo) return;
                    
                        const { meetingId } = clientInfo;
                        const meeting = meetings.get(meetingId);
                        if (!meeting || !data.target) return;
                    
                        const targetWs = meeting.get(data.target);
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

                    const { username, meetingId } = clientInfo;

                    await Message.create({
                        userId: (await User.findOne({ where: { name: username } })).id,
                        meetingId: meetingId,
                        message: data.message,
                    });

                    broadcastToMeeting(meetingId, {
                        type: "chat-message",
                        from: username,
                        message: data.message,
                        timestamp: Date.now(),
                    });
                    break;
                }
            }
        } catch (error) {
            handleError(ws, error, "Lỗi xử lý tin nhắn");
        }
    });

    ws.on("close", () => leaveMeeting(ws));
    ws.on("error", (error) => handleError(ws, error, "Lỗi WebSocket"));
});

// 🛠️ In ra URL Ngrok WebSocket để dễ kết nối
console.log("🚀 Server WebSocket đang chạy tại:");
console.log("➡️  ws://localhost:4000 (Local)");
console.log("➡️  ws://<NGROK_URL> (Public - Cập nhật URL từ Ngrok)");
