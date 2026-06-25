const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Notification = sequelize.define("Notification", {
  Notification_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Teacher_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  IsRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  Related_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Job_ID, subscription id, or other reference depending on Type",
  },
  Related_School_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Post.School_ID when notification is job/application related",
  },
}, {
  tableName: "Notifications",
  timestamps: true,
  indexes: [
    { fields: ["Teacher_ID"] },
    { fields: ["Teacher_ID", "IsRead"] },
    { fields: ["Type"] },
  ],
});

module.exports = Notification;
