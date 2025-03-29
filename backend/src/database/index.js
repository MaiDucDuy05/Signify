import { sequelize } from "../config/postgres.js";
import User from "../models/User.js";
import Meeting from "../models/Meeting.js";
import MeetingUser from "../models/MeetingUser.js";
import Message from "../models/Message.js";
import dotenv from "dotenv";
dotenv.config();

User.belongsToMany(Meeting, { through: MeetingUser, foreignKey: "userId" });
Meeting.belongsToMany(User, { through: MeetingUser, foreignKey: "meetingId" });
Meeting.hasMany(Message, { foreignKey: "meetingId" });
Message.belongsTo(Meeting, { foreignKey: "meetingId" });
Message.belongsTo(User, { foreignKey: "senderId"});
User.hasMany(Message, { foreignKey: "senderId"});

const initDB = async () => {
    try {
        await sequelize.sync({ alter: process.env.DB_ALTER === "true" });
        console.log("✅ Database synchronized.");
    } catch (error) {
        console.error("❌ Database synchronization failed:", error);
        throw error;
    }
};

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: false });
        console.log("✅ Models synchronized without altering.");
    } catch (error) {
        console.error("❌ Sync failed:", error);
        throw error;
    }
};

// Initialize the database on start only in development
if (process.env.NODE_ENV !== "production") {
    initDB();
}

export { sequelize, User, Meeting, MeetingUser, Message, syncDB, initDB };
