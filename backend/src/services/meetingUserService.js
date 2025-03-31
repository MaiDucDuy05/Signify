import { findOrCreate } from "../models/MeetingUser";

export const addUserToMeeting = async (userId, meetingId) => {
    try {
        await findOrCreate({
            where: { userId, meetingId },
            defaults: { joinedAt: new Date() }
        });
    } catch (error) {
        console.error("Error adding user to meeting:", error);
        throw error;
    }
};


export const updateUserLeaveMeeting = async (username, meetingCode) => {
    try {
        const user = await getUserByUsername(username);
        const meeting = await getMeetingByCodeMeeting(meetingCode);
        if (!meeting) throw new Error("Meeting not found");

        await MeetingUser.update({ leavedAt: new Date() }, { 
            where: { userId: user.id, meetingId: meeting.id }
        });
    } catch (error) {
        console.error("Error updating user leave meeting:", error);
        throw error;
    }
}

