const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Teacher = sequelize.define("Teacher", {
  Teacher_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Date_of_Birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      isValidGender(value) {
        if (value == null || value === "") return;
        if (!["male", "female", "other"].includes(String(value).toLowerCase())) {
          throw new Error("Gender must be male, female, or other");
        }
      },
    },
  },
  Qualifications: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  Specialization: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Teacher_Stage: {
    type: DataTypes.ENUM("Kindergarten", "Primary School", "Middle School", "High School"),
    allowNull: true,
    defaultValue: null,
  },
  Years_of_Experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  Big5_Score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  Image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
  Role: {
    type: DataTypes.ENUM("teacher", "school"),
    defaultValue: "teacher",
    allowNull: false,
  },
  Bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  Governorate: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  Auth_Provider: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: "local",
  },
  Nationality: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CV_File: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: "Public URL path e.g. /uploads/cvs/cv-123.pdf",
  },
  Profile_Completion: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  Big5_Scores: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  Average_Rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  Total_Reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  School_Name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  School_Type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  School_Size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Is_Available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  Job_Type_Preference: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  Expected_Salary: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  LinkedIn_URL: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  Website_URL: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  Reset_Token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Reset_Token_Expiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // ── Survey fields ─────────────────────────────────────────────────────────
  Survey_Classroom_Management: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Survey_Professional_Skills: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Survey_AI_Technology: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Survey_Submitted_At: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // ── School extras ─────────────────────────────────────────────────────────
  Founded_Year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // ── School content fields ✅ ───────────────────────────────────────────────
  Core_Values: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Academic_Programs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Achievements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "Teacher",
  timestamps: false,
});

module.exports = Teacher;