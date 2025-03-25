import express from "express";
import { createMeeting, getMeetings, getMeetingById } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/:id", getMeetingById);

export default router;
