import axios from "axios";
import { getAuthToken } from "./authToken.js";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
});


API.interceptors.request.use(async (config) => {
  const authData = getAuthToken();
  const token = authData?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// API Người dùng
export const getUsers = () => API.get("/users");
export const createUser = (userData) => API.post("/users", userData);

// API Họp (Meetings)
export const getMeetings = () => API.get("/meetings");
export const createMeeting = (meetingData) => API.post("/meetings", meetingData);
export const updateMeeting = (id, meetingData) => API.put(`/meetings/${id}`, meetingData);
export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);
export const getMeetingByCodeMeeting = (meetingCode) => API.get(`/meetings/code/${meetingCode}`)
export const getMeetingByUser = (userId) => API.get(`/meetings/user/${userId}`)

// API Tin nhắn (Messages)
export const getMessages = (meetingId) => API.get(`/messages/meeting/${meetingId}`);
export const sendMessage = (messageData) => API.post("/messages", messageData);

// API Xác thực (Auth)
export const signup = (userData) => API.post("/auth/signup", userData);
export const login = (credentials) => API.post("/auth/login", credentials);
export const logout = () => API.post("/auth/logout");

export default API;


