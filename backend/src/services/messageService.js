import Message from "../database/models/Message.js";

export const sendMessage = async (messageData) => {
    return await Message.create(messageData);
};

export const getMessagesByMeeting = async (meetingId) => {
    return await Message.findAll({ where: { meetingId } });
};
