import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import classNames from 'classnames/bind';
import { 
    IoIosInformationCircleOutline,
    IoIosSend 
} from "react-icons/io";
import { 
    FaMicrophone,
    FaPhoneSlash,
    FaVideo 
} from "react-icons/fa";
import { TbScreenShare } from "react-icons/tb";
import { FiMessageCircle } from "react-icons/fi";

import styles from './Meeting.module.scss';
import useWebSocketService from "../../services/useWebSocketService";
import usePeerService from "../../services/userPeerService";
import { useAuth } from "../../context/AuthContext";

const cx = classNames.bind(styles);

const Meeting = () => {
    // State management
    const [activeTab, setActiveTab] = useState('people');
    const [showSidebar, setShowSidebar] = useState(false);
    const [messages, setMessages] = useState([]);
    const [callStatus, setCallStatus] = useState("");
    const [participants, setParticipants] = useState([]);

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const messageInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // URL params and auth
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("room") || "default-room";
    const { user } = useAuth();

        // services
    const {
        socket,
        isConnected: isWebSocketConnected,
        error: webSocketError,
        sendMessage
    } = useWebSocketService(roomId, user?.name);

    const {
        localStream,
        isConnected: isPeerConnected,
        isMuted,
        isVideoEnabled,
        toggleCamera,
        toggleMicrophone,
        shareScreen,
        endCall,
        handleSocketMessage
    } = usePeerService(
        localVideoRef,
        remoteVideoRef,
        sendMessage,
        user?.name,
        setCallStatus
    );

    // Auto-scroll messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle chat messages
    const handleSendMessage = () => {
        const messageText = messageInputRef.current?.value.trim();
        if (!messageText) return;

        sendMessage({
            type: "chat-message",
            message: messageText
        });

        messageInputRef.current.value = "";
    };

    // Render helpers
    const renderMessage = (message) => {
        const isCurrentUser = message.from === user?.name;
        return (
            <li key={message.timestamp}
                className={cx(styles.MessContainItem, {
                    [styles.userMainMess]: isCurrentUser
                })}>
                <label>{message.from}</label>
                <p>{message.message}</p>
            </li>
        );
    };

    const renderParticipant = (participantName) => {
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=random`;
        return (
            <li key={participantName} className={cx(styles.peopleItem)}>
                <img src={avatarUrl} alt={participantName} />
                <p>{participantName}</p>
                {participantName === user?.name && <span>(You)</span>}
            </li>
        );
    };


    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case "error":
                        setCallStatus(data.message);
                        break;

                    case "chat-message":
                        setMessages(prev => [...prev, data]);
                        break;
                    default:
                        if (data?.participants) {
                            setParticipants(data.participants);
                        }
                        handleSocketMessage(data);
                }
            } catch (error) {
                console.error("❌ Lỗi xử lý tin nhắn:", error);
            }
        };
    }   , [socket,handleSendMessage]);

    return (
        <div className={cx(styles.wrap)}>
            {/* Header */}
            <div className={cx(styles.header)}>
                <h1>Video Meeting</h1>
                <h5>
                    <IoIosInformationCircleOutline />
                    Meeting Details
                </h5>
            </div>

            {/* Main content */}
            <div className={cx(styles.contain)}>
                {/* Video container */}
                <div className={cx(styles.videoContain)}>
                    <div ref={remoteVideoRef} className={cx(styles.remoteVideos)} />
                    <div className={cx(styles.videoLocal)}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className={cx(styles.infoContain, {
                    [styles.disable]: !showSidebar
                })}>
                    {/* Tab buttons */}
                    <div className={cx(styles.infoContainBtn)}>
                        <li 
                            onClick={() => setActiveTab('people')}
                            className={cx(styles.infoContainBtnItem,
                                { [styles.active]: activeTab === 'people' }
                            )}>
                            People ({participants.length})
                        </li>
                        <li
                            onClick={() => setActiveTab('chat')}
                            className={cx(styles.infoContainBtnItem,
                                { [styles.active]: activeTab === 'chat' }
                            )}>
                            Chat
                        </li>
                    </div>

                    {/* People list */}
                    <div className={cx(styles.PeopleContain, {
                        [styles.disable]: activeTab !== 'people'
                    })}>
                        <ul className={cx(styles.peopleList)}>
                            {participants.map(renderParticipant)}
                        </ul>
                    </div>

                    {/* Chat */}
                    <div className={cx(styles.MessContain, {
                        [styles.disable]: activeTab !== 'chat'
                    })}>
                        <ul className={cx(styles.MessContainList)}>
                            {messages.map(renderMessage)}
                            <div ref={messagesEndRef} />
                        </ul>
                        <div className={cx(styles.inputMess)}>
                            <input
                                ref={messageInputRef}
                                type="text"
                                placeholder="Type a message..."
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage}>
                                <IoIosSend />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={cx(styles.controlContain)}>
                <ul className={cx(styles.controlIconList)}>
                    <li 
                        onClick={toggleMicrophone}
                        className={cx(styles.controlIconItem, {
                            [styles.disabled]: isMuted
                        })}>
                        <FaMicrophone />
                    </li>
                    <li
                        onClick={toggleCamera}
                        className={cx(styles.controlIconItem, {
                            [styles.disabled]: !isVideoEnabled
                        })}>
                        <FaVideo />
                    </li>
                    <li
                        onClick={shareScreen}
                        className={cx(styles.controlIconItem)}>
                        <TbScreenShare />
                    </li>
                    <li
                        onClick={endCall}
                        className={cx(styles.controlIconItem, styles.endCall)}>
                        <Link to='/waiting-room'><FaPhoneSlash /></Link> 
                    </li>
                    <li
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={cx(styles.controlIconItem)}>
                        <FiMessageCircle />
                    </li>
                </ul>
            </div>

            {/* Status messages */}
            {webSocketError && (
                <div className={cx(styles.errorMessage)}>
                    {webSocketError}
                </div>
            )}
            
            {callStatus && (
                <div className={cx(styles.callStatus)}>
                    {callStatus}
                </div>
            )}
        </div>
    );
};

export default Meeting;
