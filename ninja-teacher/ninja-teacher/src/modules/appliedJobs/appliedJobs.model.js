const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const AppliedJob = sequelize.define("Application", {
  Teacher_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "Applicant (teacher account)",
  },
  School_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "Part of the composite PK with Teacher_ID + Job_ID. FK to Post.School_ID.",
  },
  Job_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "FK to Post.Job_ID (per-school sequence)",
  },
  Apply_Date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  Big5_Score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  Status: {
    type: DataTypes.ENUM("pending", "shortlisted", "interview", "accepted", "rejected"),
    defaultValue: "pending",
    allowNull: false,
  },
}, {
  tableName: "Application",
  timestamps: false,
  indexes: [
    { fields: ["School_ID", "Job_ID"] },
    { fields: ["Teacher_ID"] },
    { fields: ["Status"] },
  ],
});

module.exports = AppliedJob;