import { sequelize } from "../config/postgres.js";
import User from "../models/User.js";
import Meeting from "../models/Meeting.js";
import MeetingUser from "../models/MeetingUser.js";
import Message from "../models/Message.js";
import dotenv from "dotenv";
dotenv.config();

User.belongsToMany(Meeting, { through: MeetingUser, foreignKey: "userId", onDelete: 'CASCADE', });
Meeting.belongsToMany(User, { through: MeetingUser, foreignKey: "meetingId", onDelete: 'CASCADE', });

MeetingUser.belongsTo(Meeting, { foreignKey: 'meetingId', onDelete: 'CASCADE' });
Meeting.hasMany(MeetingUser, { foreignKey: 'meetingId' });
MeetingUser.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

Meeting.hasMany(Message, { foreignKey: "meetingId" });
Message.belongsTo(Meeting, { foreignKey: "meetingId" });

Message.belongsTo(User, { foreignKey: "senderId" });
User.hasMany(Message, { foreignKey: "senderId" });


const initDB = async () => {
    try {
        await sequelize.sync({ alter: process.env.DB_ALTER === "true" });
        console.log("✅ Database synchronized.");
    } catch (error) {
        console.error("❌ Database synchronization failed:", error);
        throw error;
    }
};

export { sequelize, User, Meeting, MeetingUser, Message, initDB };

