import sequelize from "./config.js";
import User from "./models/User.js";
import Meeting from "./models/Meeting.js";
import MeetingUser from "./models/MeetingUser.js";
import Message from "./models/Message.js";

User.belongsToMany(Meeting, { through: MeetingUser, foreignKey: "userId" });
Meeting.belongsToMany(User, { through: MeetingUser, foreignKey: "meetingId" });
User.hasMany(Message, { foreignKey: "userId" });
Meeting.hasMany(Message, { foreignKey: "meetingId" });
Message.belongsTo(User, { foreignKey: "userId" });
Message.belongsTo(Meeting, { foreignKey: "meetingId" });

const initDB = async () => {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully.");
  
      await sequelize.sync({alter: true});
      console.log("Models synchronized.");
    } catch (error) {
      console.error("Database connection failed:", error.message);
      console.error(error.stack);
    }
};

const syncDB = async () => {
    await sequelize.sync({alter: false});
    console.log("Models synchronized.");
};

export { sequelize, User, Meeting, MeetingUser, Message, syncDB, initDB};
