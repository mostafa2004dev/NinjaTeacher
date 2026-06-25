const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const ContactMessage = sequelize.define("ContactMessage", {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(100), allowNull: false },
  subject:  { type: DataTypes.STRING(200), allowNull: false },
  message:  { type: DataTypes.TEXT, allowNull: false },
  status:   { type: DataTypes.ENUM("new", "read", "replied"), defaultValue: "new" },
}, { tableName: "ContactMessages", timestamps: true });

module.exports = ContactMessage;
