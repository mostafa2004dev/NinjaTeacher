const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// Stores one assessment attempt per teacher
// The raw answers + the AI result are both saved here
const Assessment = sequelize.define("Assessment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Raw answers sent to the AI (stored as JSON for audit)
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  // ── AI Result fields ────────────────────────────────────────────────
  decision: {
    type: DataTypes.ENUM("ACCEPTED", "REJECTED"),
    allowNull: true,
  },
  confidence: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
  },
  raw_score: {
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Top factors and suggestions stored as JSON arrays
  positive_factors: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  negative_factors: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  suggestions: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Status of the AI call
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "pending",
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "Assessments",
  timestamps: true,
});

module.exports = Assessment;
