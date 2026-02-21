import express from "express";
import { createMeeting, getMeetings, getMeetingById, getMeetingByCodeMeeting, getMeetingByUser, updateMeeting, deleteMeeting } from "../controllers/meetingController.js";
import { authenticate } from "../../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", authenticate, createMeeting);
router.get("/", authenticate, getMeetings);
router.get("/user/:userId", authenticate, getMeetingByUser);
router.get("/code/:meetingCode", authenticate, getMeetingByCodeMeeting);
router.get("/:id", authenticate, getMeetingById);
router.put("/:id", authenticate, updateMeeting);
router.delete("/:id", authenticate, deleteMeeting);

export default router;
