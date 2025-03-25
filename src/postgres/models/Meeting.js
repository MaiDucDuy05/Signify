import { DataTypes } from "sequelize";
import sequelize from "../config.js";

const Meeting = sequelize.define("Meeting", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    script: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "scheduled" }, // scheduled, ongoing, ended
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endedAt: { type: DataTypes.DATE, allowNull: true },
  });
  
export default Meeting;
