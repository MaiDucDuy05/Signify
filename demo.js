import React, { useState, useEffect, useRef } from "react";

const App = () => {
    const [username, setUsername] = useState("");
    const [partner, setPartner] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const socketRef = useRef(null);
    const peerConnection = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [pendingCandidates, setPendingCandidates] = useState([]);

    // 🔹 Kết nối WebSocket khi component mount
    useEffect(() => {
        socketRef.current = new WebSocket("wss://58c6-58-186-79-9.ngrok-free.app");

        socketRef.current.onopen = () => {
            console.log("✅ WebSocket connected!");
            if (username) {
                sendMessage({ type: "register", username });
            }
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleSocketMessage(data);
        };

        return () => {
            socketRef.current.close();
        };
    }, [username]);

    // 🔹 Gửi tin nhắn WebSocket
    const sendMessage = (data) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        }
    };

    // 🔹 Lấy quyền camera/micro
    const getMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error("🚨 Lỗi khi lấy media:", error);
        }
    };

    // 🔹 Khởi tạo PeerConnection
    const initializePeerConnection = async () => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        peerConnection.current = new RTCPeerConnection();

        // 🔹 Gửi ICE Candidate
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && partner) {
                sendMessage({ type: "candidate", candidate: event.candidate, to: partner });
            }
        };

        // 🔹 Nhận track từ đối tác
        peerConnection.current.ontrack = (event) => {
            console.log("📩 Nhận track từ đối tác!", event.streams);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // 🔹 Nếu đã có localStream, thêm track vào PeerConnection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, localStream);
            });
        }
    };

    // 🔹 Xử lý tin nhắn từ WebSocket
    const handleSocketMessage = async (data) => {
        switch (data.type) {
            case "offer":
                const accept = window.confirm(`${data.from} đang gọi cho bạn. Bạn có muốn trả lời không?`);
                if (accept) {
                    await startLocalStream();
                    sendMessage({ type: "accept", from: username, to: data.from });
                }
                break;

            case "accept":
                console.log(`${data.from} đã chấp nhận cuộc gọi! Bắt đầu chia sẻ màn hình.`);
                startAcceptedCall(data.from);
                break;

            case "final-offer":
                await initializePeerConnection();
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));

                // 🔹 Nếu chưa có localStream, lấy camera/mic
                if (!localStream) {
                    const stream = await getMedia();
                    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
                }

                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                sendMessage({ type: "answer", answer, to: data.from });
                break;

                case "answer":
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    console.log("📩 Đã nhận answer!");
                
                    // ✅ Thêm các ICE Candidate bị pending
                    pendingCandidates.forEach(async candidate => {
                        try {
                            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (error) {
                            console.error("🚨 Lỗi khi thêm ICE Candidate:", error);
                        }
                    });
                    setPendingCandidates([]); // Xóa danh sách sau khi đã thêm
                    break;
                

            case "candidate":
                if (peerConnection.current && peerConnection.current.remoteDescription) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (error) {
                        console.error("🚨 Lỗi khi thêm ICE Candidate:", error);
                    }
                } else {
                    console.warn("⚠️ ICE Candidate đến sớm, chưa có Remote Description. Lưu lại...");
                    setPendingCandidates(prev => [...prev, data.candidate]);
                }
                break;

            default:
                console.warn("⚠️ Tin nhắn không xác định:", data);
        }
    };

    // 🔹 Người 1 gọi người 2
    const startCall = async () => {
        if (!partner) {
            alert("⚠️ Vui lòng nhập tên người muốn gọi.");
            return;
        }

        await startLocalStream();
        await initializePeerConnection();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        sendMessage({
            type: "offer",
            offer,
            to: partner,
        });

        console.log("📩 Gửi offer đến", partner);
    };

    // 🔹 Người 2 đồng ý và gửi final-offer
    const startAcceptedCall = async (toUser) => {
        await startLocalStream();

        const newOffer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(newOffer);

        sendMessage({ type: "final-offer", offer: newOffer, to: toUser });
    };

    // 🔹 Bắt đầu stream video cục bộ
    const startLocalStream = async () => {
        if (!localStream) {
            await getMedia();
        }
    };

    return (
        <div>
            <h2>🖥️ Call WebRTC</h2>
            <input type="text" placeholder="Nhập username..." value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" placeholder="Gọi đến ai..." value={partner} onChange={(e) => setPartner(e.target.value)} />
            <button onClick={startCall}>📞 Gọi</button>

            <h3>🔹 Màn hình của bạn</h3>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "400px", border: "1px solid black" }} />

            <h3>🔹 Màn hình đối tác</h3>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "400px", border: "1px solid black" }} />
        </div>
    );
};

export default App;
