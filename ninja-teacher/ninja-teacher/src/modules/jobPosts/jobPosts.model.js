const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Post = sequelize.define("Post", {
  School_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "FK to Teacher.Teacher_ID (school account)",
  },
  Job_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: "Per-school job sequence (not globally unique)",
  },

  Title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  Subjects: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Specialization: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Required_Stage: {
    type: DataTypes.ENUM("Kindergarten", "Primary School", "Middle School", "High School"),
    allowNull: true,
    defaultValue: null,
  },
  Job_Type: {
    type: DataTypes.ENUM("full-time", "part-time", "freelance", "contract"),
    defaultValue: "full-time",
  },
  Required_Experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  Required_Qualifications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Start_Date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Salary_Range: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Responsibilities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Requirements: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Benefits: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  Teaching_Style: {
    type: DataTypes.ENUM("strict", "flexible", "structured", "free-flowing"),
    allowNull: true,
  },
  Classroom_Energy: {
    // "balanced" added to match the Create-Post wizard option (mix of calm &
    // energetic). "collaborative" kept for backward compatibility with existing
    // rows and the canonical SQL schema.
    type: DataTypes.ENUM("calm", "energetic", "collaborative", "playful", "balanced"),
    allowNull: true,
  },
  Leadership_Style: {
    type: DataTypes.ENUM("leader", "supporter", "collaborator", "mentor"),
    allowNull: true,
  },
  Communication_Style: {
    type: DataTypes.ENUM("direct", "empathetic", "formal", "casual"),
    allowNull: true,
  },
  Problem_Solving: {
    type: DataTypes.ENUM("analytical", "creative", "practical", "innovative"),
    allowNull: true,
  },

  Date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  Status: {
    type: DataTypes.ENUM("active", "closed", "draft", "rejected"),
    defaultValue: "active",
  },
  Applicants_Count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  School_Rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
}, {
  tableName: "Post",
  timestamps: false,
});

module.exports = Post;
