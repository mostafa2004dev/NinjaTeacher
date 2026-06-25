const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── SubscriptionPlan ────────────────────────────────────────────────────────
// Seeded once at startup. Admins can update prices/features without code changes.
//
// Plans based on the pricing image:
//   teacher_free  | teacher_pro
//   school_starter | school_pro
const SubscriptionPlan = sequelize.define("SubscriptionPlan", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Unique machine-readable key — used throughout the codebase
  plan_key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    // e.g. "teacher_free", "teacher_pro", "school_starter", "school_pro"
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // e.g. "Teacher Free", "Teacher Pro"
  },
  // Which user role can subscribe to this plan
  target_role: {
    type: DataTypes.ENUM("teacher", "school"),
    allowNull: false,
  },
  price_egp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    // Monthly price in Egyptian Pounds
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    // 30 = monthly, 365 = yearly
  },
  billing_cycle: {
    type: DataTypes.ENUM("monthly", "yearly", "lifetime"),
    defaultValue: "monthly",
  },
  // JSON column storing the feature list shown on the pricing page
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    // e.g. ["Unlimited applications", "Priority profile", "Analytics"]
  },
  // Soft limits enforced at the application layer
  max_applications: {
    type: DataTypes.INTEGER,
    defaultValue: -1, // -1 = unlimited
  },
  max_job_posts: {
    type: DataTypes.INTEGER,
    defaultValue: -1, // -1 = unlimited (for school plans)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "SubscriptionPlans",
  timestamps: true,
});

module.exports = SubscriptionPlan;
