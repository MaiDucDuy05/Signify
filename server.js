const WebSocket = require("ws");

// Lắng nghe trên 0.0.0.0 để chấp nhận kết nối từ bất kỳ IP nào
const server = new WebSocket.Server({ host: "0.0.0.0", port: 3001 });

const users = {};

server.on("connection", (ws) => {
    console.log("✅ Client connected!");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "register":
                    users[data.username] = ws;
                    console.log(`👤 ${data.username} đã đăng ký.`);
                    break;

                case "offer":
                case "answer":
                case "candidate":
                case "accept": 
                case "final-offer":  
                    if (users[data.to]) {
                        users[data.to].send(JSON.stringify({ ...data, from: getUsername(ws) }));
                    }
                    break;
                case "checkUser":
                    const caller = getUsername(ws); // Lấy tên người gọi
                    const isConnected = users[data.username] ? true : false;
                
                    // 🔹 Tìm WebSocket của người gọi (caller) và gửi phản hồi
                    if (users[caller]) {
                        users[caller].send(JSON.stringify({ 
                            type: "userStatus", 
                            username: data.username, 
                            isConnected 
                        }));
                    }
                    break;
                case "callRequest":
                    if (users[data.username]) {
                        console.log(`📞 ${getUsername(ws)} gửi yêu cầu gọi tới  ${data.username}`);
                
                        users[data.username].send(JSON.stringify({ 
                            type: "incomingCall", 
                            username: getUsername(ws) 
                        }));
                    }
                    break;

                default:
                    console.warn("⚠️ Tin nhắn không xác định:", data);
            }
        } catch (error) {
            console.error("❌ Lỗi xử lý tin nhắn:", error);
        }
    });

    ws.on("close", () => {
        removeUser(ws);
    });
});

// 🔹 Hàm lấy tên user theo WebSocket
function getUsername(ws) {
    return Object.keys(users).find((name) => users[name] === ws);
}

// 🔹 Hàm xóa user khi disconnect
function removeUser(ws) {
    for (let user in users) {
        if (users[user] === ws) {
            console.log(`❌ ${user} đã ngắt kết nối.`);
            delete users[user];
            break;
        }
    }
}

// 🛠️ In ra URL Ngrok WebSocket để dễ kết nối
console.log("🚀 Server WebSocket đang chạy tại:");
console.log("➡️  ws://localhost:3001 (Local)");
console.log("➡️  ws://<NGROK_URL> (Public - Cập nhật URL từ Ngrok)");
