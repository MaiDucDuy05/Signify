import axios from "axios";
const token = localStorage.getItem("token");
const API = axios.create({
  baseURL: "http://localhost:4000/api",
  mode: 'cors',
  headers: {
    "Content-Type": "application/json",
     Authorization: `Bearer ${token}`
  },
});

// 🟢 API Người dùng
export const getUsers = () => API.get("/users");
export const createUser = (userData) => API.post("/users", userData);

// 🟢 API Họp (Meetings)
export const getMeetings = () => API.get("/meetings");
export const createMeeting = (meetingData) => API.post("/meetings", meetingData);
export const updateMeeting = (id, meetingData) => API.put(`/meetings/${id}`, meetingData);
export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);

// 🟢 API Tin nhắn (Messages)
export const getMessages = (meetingId) => API.get(`/messages?meetingId=${meetingId}`);
export const sendMessage = (messageData) => API.post("/messages", messageData);

// 🟢 API Xác thực (Auth)
export const signup = (userData) => API.post("/auth/signup", userData);
export const login = (credentials) => API.post("/auth/login", credentials);
export default API;
