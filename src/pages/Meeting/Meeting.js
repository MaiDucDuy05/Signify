import classNames from 'classnames/bind';
import { useEffect, useState,useRef } from 'react';
import { useNavigate } from "react-router-dom"; 
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";
import { TbScreenShare } from "react-icons/tb";
import { FaPhoneSlash } from "react-icons/fa6";
import { FiMessageCircle } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import styles from './Meeting.module.scss';
import {users,meeting } from "../../db/db";
import useWebSocketService from "../../services/useWebSocketService";
import usePeerService from "../../services/userPeerService";
import { useAuth } from "../../context/AuthContext";



const cx = classNames.bind(styles);

function Metting() {
    const navigate = useNavigate();
    const peopleList = meeting[0]?.users || [];
    const [searchParams] = useSearchParams();
    const inputValue = searchParams.get("data") || "Không có dữ liệu";

    const [messageList,setMessageList] = useState(meeting[0]?.mess || [])

    const [isInfo, setInFO] = useState(1);
    const [isDetail, setDetail] = useState(0);

    const [username, setUsername] = useState("");
    const [idUser,setIdUser] = useState(0)
    const [callStatus, setCallStatus] = useState("Chưa kết nối");

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [socketData, setSocketData] = useState(null);
    const { socket, sendMessage } = useWebSocketService(username);
    const inputMessageRef = useRef(null);
    const messagesEndRef = useRef(null);



    const { user} = useAuth();

    const partner = searchParams.get("data") || "Không có dữ liệu";

    useEffect(() => {
        if (user) {
            setUsername(user.name);
        }
    }, [user]);

    const handleAddMessageToPartner = (context,partner) =>{
        const messageText = context.trim(); 
        if (!messageText) return; 
        const idPartner = users.find((item) => {
            return item.name === partner
        }).id
        const newMessage = { id: messageList.length + 1,idUser: idPartner , text: messageText };
        setMessageList([...messageList,newMessage]); 
    }


    const { localStream, startCall, endCall, handleSocketMessage, 
        toggleCamera, toggleMicrophone,shareScreen} = usePeerService(
        localVideoRef,
        remoteVideoRef,
        sendMessage,
        partner,
        username,
        setCallStatus,
        handleAddMessageToPartner
    );

    useEffect(() => {
        if (!socket) return;
    
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleSocketMessage(data);
            } catch (error) {
                console.error("❌ Lỗi phân tích dữ liệu từ WebSocket:", error);
            }
        };
    
    }, [socket, handleSocketMessage]);


    //Chỉ bắt đầu cuộc gọi khi cả username và partner đã có giá trị
    useEffect(() => {
        if (username && partner) {
            console.log("Bắt đầu cuộc gọi với:", partner);
            startCall(partner);
        }
    }, [username, partner]);


    const handleAddMessage = () => {
        const messageText = inputMessageRef.current.value.trim(); // Lấy nội dung nhập vào
        if (!messageText) return; // Kiểm tra nếu input rỗng thì không thêm
        const idUser= users.find((item) => {
            return item.name === username
        }).id
        const newMessage = { id: messageList.length + 1,idUser: idUser , text: messageText };
        setMessageList([...messageList,newMessage]); // Thêm vào danh sách
        inputMessageRef.current.value = ""; // Xóa nội dung input sau khi gửi
        sendMessage({type:"send-message",content:messageText,to:partner})
    };


    useEffect(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN || !partner) return;
        let interval;
    
        const checkFriendStatus = () => {
            if (socket.readyState === WebSocket.OPEN) {
                sendMessage({ type: "checkUser", username: partner });
            } else {
                console.log("⚠️ WebSocket bị mất kết nối, dừng kiểm tra.");
                clearInterval(interval);
            }
        };
    
        const handleUserStatus = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "userStatus" && data.username === partner) {
                    
                    if (data.isConnected) {
                        console.log(`✅ ${data.username} đã online!`);
                        clearInterval(interval);
                        socket.removeEventListener("message", handleUserStatus);
                    }
                } 
            } catch (error) {
                console.error("❌ Lỗi phân tích dữ liệu WebSocket:", error);
            }
        };
    
        socket.addEventListener("message", handleUserStatus);
    
        checkFriendStatus();
        interval = setInterval(checkFriendStatus, 2000);
    
        return () => {
            clearInterval(interval);
            socket.removeEventListener("message", handleUserStatus);
        };
    }, [socket?.readyState, partner]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messageList]);

    


    return (
        <div className= {cx(styles.wrap)}>
            <div className={cx(styles.header)}>
                <h1>My Metting</h1>
                <h5><IoIosInformationCircleOutline /> Meeting Details</h5>
            </div>
            <div className={cx(styles.contain)}>
                <div className={cx(styles.videoContain)}>
                <video className={cx(styles.videoLocal)} ref={remoteVideoRef}autoPlay playsInline muted/>
                        <li className={cx(styles.videoItem)} >
                            <video  ref={localVideoRef} autoPlay playsInline muted  />
                        </li>

                </div>
                <div className={cx(styles.infoContain,{[styles.disable]:isDetail === 0})}>
                    <div  className={cx(styles.infoContainBtn)}>
                        <li onClick={() =>{setInFO(1)}} className={cx(styles.infoContainBtnItem)}>People</li>
                        <li  onClick={() =>{setInFO(0)}}  className={cx(styles.infoContainBtnItem)}>Chat</li>
                    </div>
                    <div className={cx(styles.PeopleContain, {[styles.disable]:isInfo === 0})}>
                        <ul className={cx(styles.peopleList)}>
                            {
                                peopleList.map(people =>{
                                    return(
                                        <li className={cx(styles.peopleItem)} key={people.id}>
                                        <img src={people.imgLink}></img>
                                        <p>{people.name}</p>
                                    </li>
                                    )
                                })
                            }
                            
                        </ul>
                    </div>

                    <div className={cx(styles.MessContain,{[styles.disable]:isInfo === 1})}>
                        <ul ref={messagesEndRef} className={cx(styles.MessContainList)}>
                            {
                                messageList.map(item =>{
                                    let user = peopleList.find(users =>{
                                        return users.id === item.idUser;
                                    })
                                    return (
                                        <li key={item?.id}  
                                        className={cx(styles.MessContainItem , {[styles.userMainMess]:user?.name === username})}>
                                            <label>{user?.name}</label>
                                            <p>{item?.text}</p>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className={cx(styles.inputMess)}>
                            <input ref = {inputMessageRef} type='text'></input>
                            <span onClick={() => handleAddMessage()}><IoSend /></span> 
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={cx(styles.controlContain)}>
                <ul className={cx(styles.controlIconList)}>
                    <li onClick={() => toggleMicrophone()}  className={cx(styles.controlIconItem)}><FaMicrophone /></li>
                    <li onClick={() => toggleCamera()} className={cx(styles.controlIconItem)}><FaVideo /></li>
                    <li onClick={() => {shareScreen();}} className={cx(styles.controlIconItem)}><TbScreenShare /></li>
                    <li onClick={() => endCall()} className={cx(styles.controlIconItem)}><FaPhoneSlash /></li>
                    <li onClick={() => {setDetail(1 - isDetail)}} className={cx(styles.controlIconItem)}><FiMessageCircle /></li>
                    {/* <li onClick={() => loadingCall(partner)} className={cx(styles.controlIconItem)}><FaVideo /></li> */}
                </ul>
            </div>
        </div>
    );


};


export default Metting;
