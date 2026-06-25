const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// UI teacher dashboard shows "Messages" — school messaging teachers about applications
const Message = sequelize.define("Message", {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id:   { type: DataTypes.INTEGER, allowNull: false },
  sender_name: { type: DataTypes.STRING(200), allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  subject:     { type: DataTypes.STRING(200), allowNull: true },
  body:        { type: DataTypes.TEXT, allowNull: false },
  is_read:     { type: DataTypes.BOOLEAN, defaultValue: false },
  // Context: related job application
  job_id:      { type: DataTypes.INTEGER, allowNull: true },
  job_title:   { type: DataTypes.STRING(100), allowNull: true },
  // Type: general / interview_invite / offer / rejection
  type: {
    type: DataTypes.ENUM("general", "interview_invite", "offer", "rejection"),
    defaultValue: "general",
  },
}, { tableName: "Messages", timestamps: true });

module.exports = Message;
