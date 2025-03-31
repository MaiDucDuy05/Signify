import redis from "../config/redis.js";
import Meeting from "../models/Meeting.js";
import MeetingUser from "../models/MeetingUser.js";
import MeetingUser from "../models/MeetingUser.js";

export const createMeeting = async (meetingData) => {
    
    const { host, ...meetingInfo } = meetingData;

    const meeting = await Meeting.create(meetingInfo);
    await MeetingUser.create(
        {userId:host,
            meetingId: meeting.id,
            role:"host"
        })
    
    const { host, ...meetingInfo } = meetingData;

    const meeting = await Meeting.create(meetingInfo);
    await MeetingUser.create(
        {userId:host,
            meetingId: meeting.id,
            role:"host"
        })

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

export const getMeetingByCodeMeeting = async (meetingCode) => {
    const cachedMeeting = await redis.get(`meeting:${meetingCode}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }
    const meeting = await Meeting.findOne({ where: { meetingCode}});
    if (!meeting) return null;
    await redis.set(`meeting:${meetingCode}`, JSON.stringify(meeting), "EX", 300);
    return meeting;
}

export const updateMeetingStatus = async (meetingCode, status) => {
    const meeting = await Meeting.findOne({ where: { meetingCode } });
    if (!meeting) return null;
    meeting.status = status;
    await meeting.save();
    await redis.del(`meeting:${meetingCode}`); 
    return meeting;
}

export const getMeetingByUser = async (userId) => {
    const cachedMeeting = await redis.get(`meeting:${userId}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }

    try {
        const meetings = await Meeting.findAll({
        include: [
            {
                model: MeetingUser,
                where: { userId}, 
                attributes: [], 
            },
        ],
    });
    if (!meetings.length) return null;
    await redis.set(`meeting:${userId}`, JSON.stringify(meetings), "EX", 300);
    return meetings;

    } catch(err) {
        console.log(err)
    }
};



export const getMeetingByCodeMeeting = async (meetingCode) => {
    const cachedMeeting = await redis.get(`meeting:${meetingCode}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }
    const meeting = await Meeting.findOne({ where: { meetingCode } });
    if (!meeting) return null;
    await redis.set(`meeting:${meetingCode}`, JSON.stringify(meeting), "EX", 300);
    return meeting;
}

export const getMeetingByUser = async (userId) => {
    const cachedMeeting = await redis.get(`meeting:${userId}`);
    if (cachedMeeting) {
        console.log("Get meeting from cache Redis");
        return JSON.parse(cachedMeeting);
    }

     try{
        const meetings = await Meeting.findAll({
        include: [
            {
                model: MeetingUser,
                where: { userId}, 
                attributes: [], 
            },
        ],
    });
    if (!meetings.length) return null;
    await redis.set(`meeting:${userId}`, JSON.stringify(meetings), "EX", 300);
    return meetings;

    } catch(err) {
        console.log(err)
    }
};