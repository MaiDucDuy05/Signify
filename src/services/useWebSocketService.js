import { useRef, useEffect, useState } from "react";

const useWebSocketService = (username) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!username) return;

        socketRef.current = new WebSocket("wss://57ac-58-186-79-9.ngrok-free.app");
        setSocket(socketRef.current);

        socketRef.current.onopen = () => {
            console.log("✅ WebSocket connected!");
            sendMessage({ type: "register", username });
        };

        socketRef.current.onclose = () => {
            console.log("⚠️ WebSocket closed");
        };

        return () => {
            socketRef.current?.close();
        };
    }, [username]);

    const sendMessage = (data) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        }
    };

    return { socket, sendMessage };
};

export default useWebSocketService;

