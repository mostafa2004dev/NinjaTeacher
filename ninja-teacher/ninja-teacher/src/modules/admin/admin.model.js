const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// ── Admin ─────────────────────────────────────────────────────────────────────
// جدول منفصل تمامًا عن Teacher — الأدمن مش معلم ومش مدرسة
// الأدمن ليه صلاحيات كاملة على كل حاجة في النظام
const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // super_admin → كل الصلاحيات
  // moderator  → يقدر يعدل ويشوف بس مش يحذف
  role: {
    type: DataTypes.ENUM("super_admin", "moderator"),
    defaultValue: "moderator",
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "Admins",
  timestamps: true,
});

module.exports = Admin;
