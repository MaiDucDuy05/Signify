import React, { useState, useEffect, useRef } from "react";
import VideoComponent from "../VideoComponent";
import WebSocketService from "../../services/WebSocketService";
import PeerService from "../../services/PeerService";

const App = () => {
    const [username, setUsername] = useState("");
    const [partner, setPartner] = useState("");
    const [callStatus, setCallStatus] = useState("Chưa kết nối");
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const { socketRef, sendMessage } = WebSocketService(username);
    const { localStream, startCall, endCall, handleSocketMessage } = PeerService(
        localVideoRef,
        remoteVideoRef,
        sendMessage,
        partner,
        username,
        setCallStatus
    );

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleSocketMessage(data);
                } catch (error) {
                    console.error("Lỗi phân tích dữ liệu từ WebSocket:", error);
                }
            };
        }
    }, [socketRef, handleSocketMessage]);

    return (
        <div style={styles.container}>
            <h2>🖥️ Call WebRTC</h2>
            <input
                type="text"
                placeholder="Nhập username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
            />
            <input
                type="text"
                placeholder="Gọi đến ai..."
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                style={styles.input}
            />
            <div style={styles.buttonContainer}>
                <button onClick={() => startCall(partner)} style={styles.callButton}>
                    📞 Gọi
                </button>
                <button onClick={endCall} style={styles.endButton}>
                    ❌ Kết thúc
                </button>
            </div>
            <p>📡 Trạng thái: {callStatus}</p>
            <VideoComponent localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    input: {
        margin: "5px",
        padding: "8px",
        width: "200px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
    buttonContainer: {
        margin: "10px",
    },
    callButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px 15px",
        marginRight: "5px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    endButton: {
        backgroundColor: "#e74c3c",
        color: "white",
        padding: "10px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default App;
