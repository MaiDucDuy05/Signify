import express from "express";
import { createMeeting, getMeetings, getMeetingByCodeMeeting,getMeetingByUser } from "../controllers/meetingController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", authenticate, createMeeting);
router.get("/", authenticate, getMeetings);
router.get("/:meetingCode",authenticate,getMeetingByCodeMeeting)
router.get("/user/:userId",authenticate,getMeetingByUser)
        

export default router;
