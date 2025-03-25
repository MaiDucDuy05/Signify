import express from "express";
import meetingRoutes from "./routes/meetingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
const app = express();
app.use(express.json());
app.use("/api/meetings", meetingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

export default app;