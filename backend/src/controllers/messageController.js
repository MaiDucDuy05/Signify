export function helloApi(req, res) {
    res.json({ message: 'Hello from REST API!' });
}

export function sendBroadcastMessage(req, res) {
    const { message } = req.body;
    // Đây chỉ là ví dụ, thực tế cần truyền `wss` hoặc dùng event bus
    res.json({ success: true, message: 'Broadcast simulated (add logic)' });
}