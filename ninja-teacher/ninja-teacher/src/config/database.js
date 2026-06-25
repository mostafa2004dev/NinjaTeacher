// ═══════════════════════════════════════════════════════════════════
//  config/database.js  —  اتصال Sequelize (أُعيدت كتابته بعد تلف RAR)
//  يدعم وضعين بدون تغيير أي كود آخر:
//   • MySQL  : عند ضبط DB_DIALECT=mysql (الوضع الأصلي للمشروع)
//   • SQLite : عند DB_DIALECT=sqlite أو غياب إعدادات MySQL —
//              يشتغل فورًا بدون أي سيرفر قواعد بيانات (ملف محلي)
//  كل الـ models تستورد { sequelize } من هنا كما كانت.
// ═══════════════════════════════════════════════════════════════════

const { Sequelize } = require("sequelize");
const path = require("path");

const DIALECT = (process.env.DB_DIALECT || (process.env.DB_HOST ? "mysql" : "sqlite")).toLowerCase();

let sequelize;

if (DIALECT === "mysql") {
  sequelize = new Sequelize(
    process.env.DB_NAME || "ninja_teacher",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      dialect: "mysql",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: { freezeTableName: true },
    }
  );
} else {
  const storage = process.env.SQLITE_PATH || path.join(__dirname, "../../ninja_teacher.sqlite");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
    define: { freezeTableName: true },
  });
  // Disable FK enforcement so nullable fields added to existing tables don't fail
  sequelize.afterConnect(async (conn) => conn.run("PRAGMA foreign_keys = OFF;"));
}

module.exports = { sequelize, Sequelize };
