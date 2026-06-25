const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── Invoice ───────────────────────────────────────────────────────────────────
// Generated automatically when a payment succeeds.
// Provides a human-readable receipt for the user.
const Invoice = sequelize.define("Invoice", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subscription_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Human-readable invoice number: INV-2026-00001
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: "EGP",
  },
  // Snapshot of what was purchased
  plan_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  billing_period_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  billing_period_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // issued | void
  status: {
    type: DataTypes.ENUM("issued", "void"),
    defaultValue: "issued",
  },
}, {
  tableName: "Invoices",
  timestamps: true,
});

module.exports = Invoice;
