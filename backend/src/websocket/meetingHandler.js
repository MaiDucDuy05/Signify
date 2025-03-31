import { updateMeetingStatus } from "../services/meetingService";
import { addUserToMeeting, updateUserLeaveMeeting } from "../services/meetingUserService";
import { sendMessage } from "../services/messageService";

export function broadcastToMeeting(meetingCode, message, exclude = null) {
        if (!meetings.has(meetingCode)) return;
        meetings.get(meetingCode).forEach((clientWs) => {
            if (clientWs !== exclude && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(message));
            }
        });
}
    
export async function handleleaveMeeting(clients, meetings, ws) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;

    const { username, meetingCode } = clientInfo;
    if (!meetings.has(meetingCode)) return;

    const meeting = meetings.get(meetingCode);
    meeting.delete(username);
    await updateUserLeaveMeeting(username, meetingCode);
    
    if(meeting[username].size == 0) {
        await updateMeetingStatus(meetingCode, "ended");
    }

    broadcastToMeeting(meetingCode, { type: "user-left", username });

    if (meeting.size === 0) meetings.delete(meetingCode);

    clients.delete(ws);
    console.log(`${username} đã rời cuộc họp ${meetingCode}`);
}

export async function handleJoinMeeting(clients, meetings, ws, data) {
    const { username, meetingCode } = data;
                        
    // Tạo phòng mới nếu chưa tồn tại
    if (!meetings.has(meetingCode)) meetings.set(meetingCode, new Map());
    const meeting = meetings.get(meetingCode);
    
    // Kiểm tra xem username đã tồn tại trong phòng chưa
    if (meeting.has(username)) return;

    // Thêm người dùng vào phòng
    meeting.set(username, ws);
    clients.set(ws, { username, meetingCode });
    let userRecord = await getUserByUsername(username);
    let meetingRecord = await getMeetingByCodeMeeting(meetingCode)
    if (meetingRecord?.status !== "ongoing") {
        await updateMeetingStatus(meetingCode, "ongoing");
    }
    const meetingId = meetingRecord.id;
    await addUserToMeeting(userRecord.id, meetingId);

    // Gửi danh sách người trong phòng cho người mới
    ws.send(JSON.stringify({
        type: "meeting-info",
        participants: Array.from(meeting.keys()),
    }));
    
    // Thông báo cho mọi người về người mới
    broadcastToMeeting(meetingCode, {
        type: "user-joined",
        username,
        participants: Array.from(meeting.keys()),
    }, ws);

    console.log(`${username} đã vào cuộc họp ${meetingCode}`);
}

export function handleWebRTCSignaling(clients, meetings, ws, data) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;

    const { meetingCode } = clientInfo;
    const meeting = meetings.get(meetingCode);
    if (!meeting || !data.target) return;

    const targetWs = meeting.get(data.target);
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(JSON.stringify({
            ...data,
            from: clientInfo.username
        }));
    }
}

export async function handleChatMessage(clients, ws, data) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;
    const { username, meetingCode } = clientInfo;

    broadcastToMeeting(meetingCode, {
                            type: "chat-message",
                            from: username,
                            message: data.message,
                            timestamp: Date.now(),
    });
    
        
    await sendMessage({
        senderId: (await User.findOne({ where: { name: username } })).id,
        meetingId: (await Meeting.findOne({ where: {meetingCode } })).id,
        text: data.message,
    });
}