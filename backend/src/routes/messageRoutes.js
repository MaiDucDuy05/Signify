import express from "express";
import { sendMessage, getMessagesByMeeting } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);
router.get("/meeting/:meetingId", getMessagesByMeeting);

export default router;
