import { DataTypes } from "sequelize";
import sequelize from "../../config/postgres.js";
import User from "./User.js";
import Meeting from "./Meeting.js";

const MeetingUser = sequelize.define("MeetingUser", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
  meetingId: { type: DataTypes.UUID, allowNull: false, references: { model: Meeting, key: "id" } },
  role: { type: DataTypes.ENUM("host", "participant"), allowNull: false, defaultValue: "participant" },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});


export default MeetingUser;
