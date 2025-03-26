import express from "express";
import { sendMessage, getMessagesByMeeting } from "../controllers/messageController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", authenticate, sendMessage);
router.get("/meeting/:meetingId", authenticate, getMessagesByMeeting);

export default router;
