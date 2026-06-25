const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── Subscription ─────────────────────────────────────────────────────────────
// Tracks the ACTIVE (or most recent) subscription for each user.
// One user has at most ONE active subscription at a time.
// History is tracked via the status field + createdAt/updatedAt.
const Subscription = sequelize.define("Subscription", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // References Teacher.Teacher_ID
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // References SubscriptionPlan.id
  },
  status: {
    type: DataTypes.ENUM("active", "cancelled", "expired", "pending_payment"),
    defaultValue: "pending_payment",
    allowNull: false,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
    // Set when payment is confirmed and subscription is activated
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    // started_at + plan.duration_days
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Snapshot of the price paid — because plan prices may change later
  price_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // auto_renew: future feature — if true, system renews before expiry
  auto_renew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Notes field for admin use (e.g. "upgraded from teacher_free")
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "Subscriptions",
  timestamps: true,
  underscored: true,  // maps createdAt→created_at, updatedAt→updated_at in DB
});

module.exports = Subscription;
