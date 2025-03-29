import axios from "axios";
import { getAuthToken } from "./authToken.js";

const API = axios.create({
  // baseURL: "http://localhost:4000/api",
  baseURL:"https://5e50-58-186-166-154.ngrok-free.app/api",
  mode: "cors",
  headers: { "Content-Type": "application/json" },
});

// 🟢 Thêm Interceptor để tự động gán token
API.interceptors.request.use(async (config) => {
  const jsonString  = await getAuthToken(); 
  const token = JSON.parse(jsonString)?.token
  console.log(token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🟢 API Người dùng
export const getUsers = () => API.get("/users");
export const createUser = (userData) => API.post("/users", userData);

// 🟢 API Họp (Meetings)
export const getMeetings = () => API.get("/meetings");
export const createMeeting = (meetingData) => API.post("/meetings", meetingData);
export const updateMeeting = (id, meetingData) => API.put(`/meetings/${id}`, meetingData);
export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);
export const getMeetingByCodeMeeting = (meetingCode) => API.get(`/meetings/${meetingCode}`)
export const getMeetingByUser = (userId) =>API.get(`/meetings/user/${userId}`)

// 🟢 API Tin nhắn (Messages)
export const getMessages = (meetingId) => API.get(`/messages?meetingId=${meetingId}`);
export const sendMessage = (messageData) => API.post("/messages", messageData);

// 🟢 API Xác thực (Auth)
export const signup = (userData) => API.post("/auth/signup", userData);
export const login = (credentials) => API.post("/auth/login", credentials);

export default API;
