// src/hooks/usePeerService.js
import { useState, useRef, useEffect } from "react";
const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { 
            urls: "turn:openrelay.metered.ca:80", 
            username: "openrelayproject", 
            credential: "openrelayproject"
        }
    ]
};

const usePeerService = (localVideoRef, remoteVideoRef, sendMessage, partner, username, setCallStatus) => {
    const [localStream, setLocalStream] = useState(null);
    const peerConnection = useRef(null);
    const [pendingCandidates, setPendingCandidates] = useState([]);

    // 🔹 Lấy camera/micro
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

    // 🔹 Khởi tạo kết nối WebRTC
    const initializePeerConnection = async () => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        peerConnection.current = new RTCPeerConnection(servers);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && partner) {
                sendMessage({ type: "candidate", candidate: event.candidate, to: partner });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, localStream);
            });
        }
    };


     // 🔹 Bắt đầu stream video cục bộ
     const startLocalStream = async () => {
        if (!localStream) {
            await getMedia();
        }
    };

    // 🔹 Xử lý tin nhắn từ WebSocket
    const handleSocketMessage = async (data) => {
        switch (data.type) {
            case "offer":
            // 🔹 Gửi yêu cầu kiểm tra trạng thái người gọi
                sendMessage({ type: "checkUser", username: data.from });
                break;

            case "userStatus":
                if (data.isConnected) {
                    const accept = window.confirm(`${data.username} đang gọi cho bạn. Bạn có muốn trả lời không?`);
                    if (accept) {
                        await startLocalStream();
                        sendMessage({ type: "accept", from: username, to: data.username });
                    }
                } else {
                    console.log("📢 Người gọi đã offline, không hiển thị popup.");
                }
                break;
            // case "offer":
            //     const accept = window.confirm(`${data.from} đang gọi cho bạn. Bạn có muốn trả lời không?`);
            //     if (accept) {
            //         await startLocalStream();
            //         sendMessage({ type: "accept", from: username, to: data.from });
            //     }
            //     break;

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

            case "incomingCall":
                sendMessage({ type: "acceptCall", username: data.from });
                break;
            case "acceptCall":
                startCall(partner);
                break;

            default:
                console.warn("⚠️ Tin nhắn không xác định:", data);
        }
    };

    // 🔹 Bắt đầu cuộc gọi (Người 1)
    const startCall = async () => {
        if (!partner) {
            alert("⚠️ Vui lòng nhập tên người muốn gọi.");
            return;
        }

        setCallStatus("Đang gọi... 📞");

        await getMedia();
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

    // Bat dau chap nhan cuoc goi
    const startAcceptedCall = async (toUser) => {
        await startLocalStream();

        const newOffer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(newOffer);

        sendMessage({ type: "final-offer", offer: newOffer, to: toUser });
    };

    // 🔹 Bật/Tắt Camera
    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
            }
        }
    };

    // 🔹 Bật/Tắt Microphone
    const toggleMicrophone = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
            }
        }
    };

    // 🔹 Chia sẻ màn hình
    const shareScreen = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            if (peerConnection.current) {
                // Thay thế video track hiện tại bằng screen track
                const sender = peerConnection.current.getSenders().find(s => s.track.kind === "video");
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            }

            screenTrack.onended = () => {
                revertToCamera(); // Khi tắt chia sẻ màn hình, quay lại camera
            };
        } catch (error) {
            console.error("🚨 Lỗi khi chia sẻ màn hình:", error);
        }
    };

    // 🔹 Chuyển về camera sau khi tắt chia sẻ màn hình
    const revertToCamera = async () => {
        const cameraStream = await getMedia();
        const cameraTrack = cameraStream.getVideoTracks()[0];

        if (peerConnection.current) {
            const sender = peerConnection.current.getSenders().find(s => s.track.kind === "video");
            if (sender) {
                sender.replaceTrack(cameraTrack);
            }
        }
    };



    // 🔹 Kết thúc cuộc gọi
    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        setCallStatus("Cuộc gọi đã kết thúc ❌");
    };

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, []);

    return { localStream, startCall, endCall,handleSocketMessage, toggleCamera, toggleMicrophone,shareScreen };
};

export default usePeerService;
