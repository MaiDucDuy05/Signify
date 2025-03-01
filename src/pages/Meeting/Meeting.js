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

import { getAuthToken } from "../../token";
import styles from './Meeting.module.scss';
import { meeting } from "../../db/db";
import useWebSocketService from "../../services/useWebSocketService";
import usePeerService from "../../services/userPeerService";


// const styles = {
//     container: {
//         textAlign: "center",
//         padding: "20px",
//         fontFamily: "Arial, sans-serif",
//     },
//     input: {
//         margin: "5px",
//         padding: "8px",
//         width: "200px",
//         border: "1px solid #ccc",
//         borderRadius: "5px",
//     },
//     buttonContainer: {
//         margin: "10px",
//     },
//     callButton: {
//         backgroundColor: "#4CAF50",
//         color: "white",
//         padding: "10px 15px",
//         marginRight: "5px",
//         border: "none",
//         borderRadius: "5px",
//         cursor: "pointer",
//     },
//     endButton: {
//         backgroundColor: "#e74c3c",
//         color: "white",
//         padding: "10px 15px",
//         border: "none",
//         borderRadius: "5px",
//         cursor: "pointer",
//     },
// };


const cx = classNames.bind(styles);

function Metting() {
    const navigate = useNavigate();
    const peopleList = meeting[0]?.users || [];
    // const messageList = meeting[0]?.mess || [];

    const [messageList,setMessageList] = useState(meeting[0]?.mess || [])

    const [isInfo, setInFO] = useState(1);
    const [isDetail, setDetail] = useState(0);

    const [username, setUsername] = useState("");
    const [partner, setPartner] = useState("");
    const [idUser,setIdUser] = useState(0)
    const [callStatus, setCallStatus] = useState("Chưa kết nối");

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [socketData, setSocketData] = useState(null);
    const { socket, sendMessage } = useWebSocketService(username);
    const inputMessageRef = useRef(null);

    // Lấy token và cập nhật username
    useEffect(() => {
        const rawToken = getAuthToken();
        console.log("Token nhận được:", rawToken);

        if (!rawToken) {
            navigate("/");
            return;
        }

        const token = typeof rawToken === "string" ? JSON.parse(rawToken) : rawToken;

        if (token && token.name) {
            setUsername(token.name);
            setIdUser(token?.id)
        } else {
            console.error("Token không chứa name:", token);
        }
    }, []);


    const { localStream, startCall, endCall, handleSocketMessage, 
        toggleCamera, toggleMicrophone,shareScreen } = usePeerService(
        localVideoRef,
        remoteVideoRef,
        sendMessage,
        partner,
        username,
        setCallStatus
    );

    useEffect(() => {
        if (socket) {
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleSocketMessage(data);
                } catch (error) {
                    console.error("Lỗi phân tích dữ liệu từ WebSocket:", error);
                }
            };
        }
    }, [socket, handleSocketMessage]);

    // Cập nhật partner khi username có giá trị
    useEffect(() => {
        if (!username) return;
        console.log("Username đã cập nhật:", username);
    
        const autoPartner = username === "Jone" ? "Mai Duy" : "Jone";
        setPartner(autoPartner);
    }, [username]);

    // Chỉ bắt đầu cuộc gọi khi cả username và partner đã có giá trị
    useEffect(() => {
        if (username && partner) {
            console.log("Bắt đầu cuộc gọi với:", partner);
            startCall(partner);
        }
    }, [username, partner]);


    const handleAddMessage = () => {
        const messageText = inputMessageRef.current.value.trim(); // Lấy nội dung nhập vào
        if (!messageText) return; // Kiểm tra nếu input rỗng thì không thêm


        const newMessage = { id: messageList.length + 1,idUser: idUser , text: messageText };
        console.log(messageList[0])
        setMessageList([...messageList,newMessage]); // Thêm vào danh sách
        inputMessageRef.current.value = ""; // Xóa nội dung input sau khi gửi
    };


    return (
        <div className= {cx(styles.wrap)}>
            <div className={cx(styles.header)}>
                <h1>My Metting</h1>
                <h5><IoIosInformationCircleOutline /> Meeting Details</h5>
            </div>
            <div className={cx(styles.contain)}>
                <div className={cx(styles.videoContain)}>
                <video className={cx(styles.videoLocal)} ref={remoteVideoRef}autoPlay playsInline/>
                        <li className={cx(styles.videoItem)} >
                            <video  ref={localVideoRef} autoPlay playsInline  />
                        </li>

                </div>
                <div className={cx(styles.infoContain,{[styles.disable]:isDetail == 0})}>
                    <div  className={cx(styles.infoContainBtn)}>
                        <li onClick={() =>{setInFO(1)}} className={cx(styles.infoContainBtnItem)}>People</li>
                        <li  onClick={() =>{setInFO(0)}}  className={cx(styles.infoContainBtnItem)}>Chat</li>
                    </div>
                    <div className={cx(styles.PeopleContain, {[styles.disable]:isInfo == 0})}>
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

                    <div className={cx(styles.MessContain,{[styles.disable]:isInfo == 1})}>
                        <ul className={cx(styles.MessContainList)}>
                            {
                                messageList.map(item =>{
                                    let user = peopleList.find(users =>{
                                        return users.id == item.idUser;
                                    })
                                    return (
                                        <li key={item.id}  
                                        className={cx(styles.MessContainItem , {[styles.userMainMess]:user.id == 1})}>
                                            <label>{user.name}</label>
                                            <p>{item.text}</p>
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
                    <li onClick={() => startCall(partner)} className={cx(styles.controlIconItem)}><FaVideo /></li>
                </ul>
            </div>
        </div>
    );

    // return (
    //     <div style={styles.container}>
    //         <h2>🖥️ Call WebRTC</h2>
    //         <div style={styles.buttonContainer}>
    //             <button onClick={() => startCall(partner)} style={styles.callButton}>
    //                 📞 Gọi
    //             </button>
    //             <button onClick={endCall} style={styles.endButton}>
    //                 ❌ Kết thúc
    //             </button>
    //         </div>
    //         <p>📡 Trạng thái: {callStatus}</p>
    //         <VideoComponent localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} />
    //     </div>
    // );
};


export default Metting;
