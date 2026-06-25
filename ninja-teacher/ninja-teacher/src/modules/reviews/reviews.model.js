const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// UI home page shows "What Schools Say About Us" — school reviews of teachers
// Also shows "Highest Rated Teachers" section with star ratings
const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Who wrote the review (school)
  reviewer_id:   { type: DataTypes.INTEGER, allowNull: false },
  reviewer_name: { type: DataTypes.STRING(200), allowNull: false },
  reviewer_type: { type: DataTypes.ENUM("school", "teacher"), defaultValue: "school" },
  // Who is being reviewed (teacher); nullable for general platform testimonials
  teacher_id: { type: DataTypes.INTEGER, allowNull: true },
  rating:     { type: DataTypes.DECIMAL(2, 1), allowNull: false }, // 1.0 - 5.0
  comment:    { type: DataTypes.TEXT, allowNull: true },
  // Job context
  job_title:  { type: DataTypes.STRING(100), allowNull: true },
  job_id:     { type: DataTypes.INTEGER, allowNull: true },
  is_visible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "Reviews", timestamps: true });

module.exports = Review;
