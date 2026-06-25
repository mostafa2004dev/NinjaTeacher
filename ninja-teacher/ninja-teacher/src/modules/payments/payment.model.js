const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── Payment ───────────────────────────────────────────────────────────────────
// Each payment attempt creates one row.
// Multiple failed attempts may exist before one succeeds.
const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Reference back to the subscription this payment is for
  subscription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Amount charged in Egyptian Pounds
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: "EGP",
  },
  // Which payment provider processed this
  provider: {
    type: DataTypes.ENUM("instapay", "vodafone_cash", "orange_cash", "manual", "free"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "failed", "expired", "refunded"),
    defaultValue: "pending",
    allowNull: false,
  },
  // Our own unique reference for this transaction
  transaction_ref: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  // The reference/receipt number returned by the payment provider
  provider_ref: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  // Full raw response from the provider (stored as JSON for audit)
  provider_response: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // When the user submits their payment proof (e.g. Vodafone Cash receipt number)
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // For manual payments: when an admin confirmed/rejected it
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verified_by: {
    type: DataTypes.STRING(100),
    allowNull: true, // admin identifier
  },
  // Payments expire after a window (e.g. 24h) if user doesn't complete payment
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Optional: user-submitted proof (photo path, receipt number, etc.)
  payment_proof: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  failure_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: "Payments",
  timestamps: true,
});

module.exports = Payment;
