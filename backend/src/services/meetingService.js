import Meeting from "../postgres/models/Meeting.js";

export const createMeeting = async (meetingData) => {
    return await Meeting.create(meetingData);
};

export const getMeetings = async () => {
    return await Meeting.findAll();
};

export const getMeetingById = async (id) => {
    return await Meeting.findByPk(id);
};
