const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// WorkExperience
const WorkExperience = sequelize.define("WorkExperience", {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id:  { type: DataTypes.INTEGER, allowNull: false },
  job_title:   { type: DataTypes.STRING(100), allowNull: false },
  school_name: { type: DataTypes.STRING(200), allowNull: false },
  location:    { type: DataTypes.STRING(200), allowNull: true },
  subject:     { type: DataTypes.STRING(100), allowNull: true },
  start_date:  { type: DataTypes.DATEONLY,    allowNull: true },
  end_date:    { type: DataTypes.DATEONLY,    allowNull: true },
  is_current:  { type: DataTypes.BOOLEAN,     defaultValue: false },
  description: { type: DataTypes.TEXT,        allowNull: true },
}, { tableName: "WorkExperience", timestamps: true });

// Education
const Education = sequelize.define("Education", {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id:  { type: DataTypes.INTEGER, allowNull: false },
  degree:      { type: DataTypes.STRING(100), allowNull: false },
  institution: { type: DataTypes.STRING(200), allowNull: false },
  field:       { type: DataTypes.STRING(100), allowNull: true },
  start_year:  { type: DataTypes.INTEGER,     allowNull: true },
  end_year:    { type: DataTypes.INTEGER,     allowNull: true },
  grade:       { type: DataTypes.STRING(50),  allowNull: true },
  description: { type: DataTypes.TEXT,        allowNull: true },
}, { tableName: "Education", timestamps: true });

// Certification
const Certification = sequelize.define("Certification", {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id:     { type: DataTypes.INTEGER, allowNull: false },
  title:          { type: DataTypes.STRING(200), allowNull: false },
  issuing_org:    { type: DataTypes.STRING(200), allowNull: true },
  issue_date:     { type: DataTypes.DATEONLY,    allowNull: true },
  expiry_date:    { type: DataTypes.DATEONLY,    allowNull: true },
  credential_id:  { type: DataTypes.STRING(100), allowNull: true },
  credential_url: { type: DataTypes.STRING(500), allowNull: true },
  description:    { type: DataTypes.TEXT,        allowNull: true },
}, { tableName: "Certifications", timestamps: true });

module.exports = { WorkExperience, Education, Certification };