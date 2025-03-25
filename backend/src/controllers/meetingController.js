import Meeting from "../postgres/models/Meeting.js";

export const createMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.create(req.body);
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.findAll();
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findByPk(req.params.id);
        if (!meeting) return res.status(404).json({ message: "Meeting not found" });
        res.status(200).json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
