import * as meetingService from "../services/meetingService.js";

export const createMeeting = async (req, res) => {
    try {
        const meeting = await meetingService.createMeeting(req.body);
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const meetings = await meetingService.getMeetings();
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// export const getMeetingById = async (req, res) => {
//     try {
//         const meeting = await meetingService.getMeetingById(req.params.id);
//         if (!meeting) return res.status(404).json({ message: "Meeting not found" });
//         res.status(200).json(meeting);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


export const getMeetingByCodeMeeting = async(req,res) =>{
    try {
        const meeting = await meetingService.getMeetingByCodeMeeting(req.params.meetingCode);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



export const getMeetingByUser = async(req,res) => {
    console.log(req.params)
    try {
        const meeting = await meetingService.getMeetingByUser(req.params.userId);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
