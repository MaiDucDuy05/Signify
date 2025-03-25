import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export const getUsers = () => API.get("/users");


export const createUser = (userData) => API.post("/users", userData);

export const getMeetings = () => API.get("/meetings");

export const createMeeting = (meetingData) => API.post("/meetings", meetingData);

export const updateMeeting = (id, meetingData) => API.put(`/meetings/${id}`, meetingData);


export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);

export const getMessages = (meetingId) => API.get(`/messages?meetingId=${meetingId}`);


export const sendMessage = (messageData) => API.post("/messages", messageData);

export default API;
