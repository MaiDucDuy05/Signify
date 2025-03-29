import express from "express";
import { createMeeting, getMeetings, getMeetingById } from "../controllers/meetingController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", authenticate, createMeeting);
router.get("/", authenticate, getMeetings);
router.get("/:id", authenticate, getMeetingById);

export default router;
