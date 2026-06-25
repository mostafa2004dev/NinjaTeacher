const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── AdminNotification ───────────────────────────────────────────────────────
// ده مختلف تمامًا عن Notification الموجود (اللي بيتبعت للـ Teacher).
// ده feed داخلي للأدمن نفسه: matches جديدة، طلبات pending، فواتير، تنبيهات نظام...
const AdminNotification = sequelize.define("AdminNotification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // "match" | "approval" | "billing" | "system"
  type: {
    type: DataTypes.ENUM("match", "approval", "billing", "system"),
    allowNull: false,
    defaultValue: "system",
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // ID اختياري لربط الإشعار بحاجة معينة (match_id, post_id, payment_id...)
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "AdminNotifications",
  timestamps: true,
});

module.exports = AdminNotification;