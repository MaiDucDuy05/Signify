import redis from "../config/redis.js";
import Meeting from "../models/Meeting.js";

export const createMeeting = async (meetingData) => {
    const meeting = await Meeting.create(meetingData);

    await redis.del("meetings"); 

    return meeting;
};

export const getMeetings = async () => {
    const cachedMeetings = await redis.get("meetings");
    if (cachedMeetings) {
        console.log("Get meetings from cache Redis");
        return JSON.parse(cachedMeetings);
    }

    const meetings = await Meeting.findAll();
    await redis.set("meetings", JSON.stringify(meetings), "EX", 600);
    return meetings;
};

export const getMeetingById = async (id) => {
    const cachedMeeting = await redis.get(`meeting:${id}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }
    const meeting = await Meeting.findByPk(id);
    if (!meeting) return null;

    await redis.set(`meeting:${id}`, JSON.stringify(meeting), "EX", 300);
    return meeting;
};
