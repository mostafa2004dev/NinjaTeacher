/**
 * SQLite → MySQL Migration Script
 * Preserves all IDs, FKs, and relationships.
 * Run once from the ninja-teacher directory.
 */

"use strict";
process.chdir(__dirname);
require("dotenv").config();

const { Sequelize, DataTypes } = require("sequelize");

const SQLITE_PATH = "./ninja_teacher.sqlite";
const MYSQL_DB   = "school_jobs";
const MYSQL_USER = "root";
const MYSQL_PASS = "";
const MYSQL_HOST = "localhost";
const MYSQL_PORT = 3306;

const sqlite = new Sequelize({
  dialect: "sqlite",
  storage: SQLITE_PATH,
  logging: false,
});

const mysql = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASS, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: "mysql",
  logging: false,
  dialectOptions: { connectTimeout: 10000 },
});

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(msg); }
function warn(msg) { console.warn("  WARN:", msg); }

async function sqliteRows(table) {
  try {
    const [rows] = await sqlite.query(`SELECT * FROM "${table}"`);
    return rows;
  } catch (e) {
    warn(`SQLite table "${table}" not found — skipping. (${e.message})`);
    return [];
  }
}

async function mysqlCount(table) {
  try {
    const [rows] = await mysql.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    return Number(rows[0].cnt);
  } catch (e) {
    return -1;
  }
}

function escVal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return `'${v.toISOString().replace("T", " ").replace(/\.\d+Z$/, "")}'`;
  // Stringify objects/arrays (JSON columns)
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/**
 * Upsert rows into a MySQL table.
 * Uses INSERT INTO ... ON DUPLICATE KEY UPDATE to handle re-runs safely.
 */
async function upsertRows(table, rows, pkCols) {
  if (!rows.length) { log(`  ${table}: 0 rows — skipped`); return 0; }

  const cols = Object.keys(rows[0]);
  const updateCols = cols.filter(c => !pkCols.includes(c));

  let inserted = 0;
  for (const row of rows) {
    const vals = cols.map(c => escVal(row[c])).join(", ");
    const updates = updateCols.length
      ? "ON DUPLICATE KEY UPDATE " + updateCols.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(", ")
      : "ON DUPLICATE KEY UPDATE `${pkCols[0]}` = `${pkCols[0]}`"; // no-op if no non-PK cols

    const sql = `INSERT INTO \`${table}\` (\`${cols.join("`,`")}\`) VALUES (${vals}) ${updates}`;
    try {
      await mysql.query(sql);
      inserted++;
    } catch (e) {
      warn(`  Row insert failed in ${table}: ${e.message.substring(0, 120)}`);
      warn(`  Row data: ${JSON.stringify(row).substring(0, 200)}`);
    }
  }
  return inserted;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  log("\n════════════════════════════════════════════════════════════");
  log("  SQLite → MySQL Migration");
  log("════════════════════════════════════════════════════════════\n");

  await sqlite.authenticate();
  log("✓ SQLite connected");
  await mysql.authenticate();
  log("✓ MySQL connected\n");

  // ── STEP 1: Save MySQL-only admins before schema wipe ──────────────────────
  log("── Saving MySQL-only admins ─────────────────────────────────");
  const [mysqlAdmins] = await mysql.query("SELECT * FROM `admins`");
  const [sqliteAdmins] = await sqlite.query('SELECT email FROM "Admins"');
  const sqliteEmails = new Set(sqliteAdmins.map(a => a.email));
  const mysqlOnlyAdmins = mysqlAdmins.filter(a => !sqliteEmails.has(a.email));
  log(`  MySQL has ${mysqlAdmins.length} admins, ${mysqlOnlyAdmins.length} not in SQLite: ${mysqlOnlyAdmins.map(a => a.email).join(", ") || "none"}`);

  // ── STEP 2: Recreate MySQL schema from current Sequelize models ────────────
  log("\n── Recreating MySQL schema from current models ──────────────");
  // Load all models so Sequelize knows about associations
  const db_cfg = { sequelize: mysql, DataTypes };
  // Require all model files — they register themselves on the mysql sequelize instance
  // We do this by temporarily pointing the config to mysql
  // Simplest: just run sync via the app's own model loader

  // Disable FK checks during drop/recreate
  await mysql.query("SET FOREIGN_KEY_CHECKS = 0");

  // Drop tables in safe order (children first)
  const dropOrder = [
    "Application","SavedJobs","Assessments","Certifications","Education",
    "WorkExperience","Reviews","Notifications","Messages","Matches",
    "Invoices","Payments","Subscriptions","Post","Teacher",
    "Admins","SubscriptionPlans","ContactMessages",
    // legacy tables
    "job","school",
  ];
  for (const t of dropOrder) {
    try {
      await mysql.query(`DROP TABLE IF EXISTS \`${t}\``);
    } catch(e) { /* ignore */ }
  }
  log("  Dropped all existing MySQL tables");

  // Now sync models — load them fresh against the mysql sequelize instance
  // We use the app's model files directly
  const path = require("path");

  // Temporarily patch sequelize in config so models bind to mysql
  const dbModule = require("./src/config/database");
  // Override the exported sequelize to point at mysql
  dbModule.sequelize = mysql;

  // Load models (each requires sequelize from config/database)
  const models = [
    "./src/modules/users/users.model",
    "./src/modules/admin/admin.model",
    "./src/modules/jobPosts/jobPosts.model",
    "./src/modules/appliedJobs/appliedJobs.model",
    "./src/modules/assessment/assessment.model",
    "./src/modules/notifications/notifications.model",
    "./src/modules/reviews/reviews.model",
    "./src/modules/messages/messages.model",
    "./src/modules/subscriptions/subscription.model",
    "./src/modules/subscriptions/subscription.plans.model",
    "./src/modules/subscriptions/payments.model",
    "./src/modules/subscriptions/invoices.model",
    "./src/modules/contact/contact.model",
    "./src/modules/savedJobs/savedJobs.model",
    "./src/modules/certificates/certificates.model",
    "./src/modules/education/education.model",
    "./src/modules/workExperience/workExperience.model",
    "./src/modules/matches/matches.model",
  ];

  const loaded = [];
  for (const m of models) {
    try {
      const mod = require(m);
      loaded.push(m);
    } catch(e) {
      warn(`Model not found: ${m} (${e.message.substring(0,80)})`);
    }
  }
  log(`  Loaded ${loaded.length} models`);

  await mysql.sync({ force: false }); // tables already dropped; create fresh
  log("  MySQL schema created from models\n");

  await mysql.query("SET FOREIGN_KEY_CHECKS = 0");

  // ── STEP 3: Import data from SQLite ───────────────────────────────────────
  log("── Importing SQLite data → MySQL ────────────────────────────");

  // Table map: [SQLiteTable, MySQLTable, pkCols]
  const tableMap = [
    ["Teacher",           "Teacher",           ["Teacher_ID"]],
    ["Admins",            "Admins",             ["id"]],
    ["SubscriptionPlans", "SubscriptionPlans",  ["id"]],
    ["Post",              "Post",               ["School_ID","Job_ID"]],
    ["Application",       "Application",        ["Teacher_ID","School_ID","Job_ID"]],
    ["Assessments",       "Assessments",        ["id"]],
    ["Reviews",           "Reviews",            ["id"]],
    ["Notifications",     "Notifications",      ["Notification_ID"]],
    ["Messages",          "Messages",           ["id"]],
    ["Matches",           "Matches",            ["id"]],
    ["Subscriptions",     "Subscriptions",      ["id"]],
    ["Payments",          "Payments",           ["id"]],
    ["Invoices",          "Invoices",           ["id"]],
    ["SavedJobs",         "SavedJobs",          ["id"]],
    ["Certifications",    "Certifications",     ["id"]],
    ["Education",         "Education",          ["id"]],
    ["WorkExperience",    "WorkExperience",     ["id"]],
    ["ContactMessages",   "ContactMessages",    ["id"]],
  ];

  const results = [];
  for (const [srcTable, dstTable, pks] of tableMap) {
    const rows = await sqliteRows(srcTable);
    const count = await upsertRows(dstTable, rows, pks);
    results.push({ srcTable, dstTable, sqliteCount: rows.length, mysqlInserted: count });
    log(`  ${srcTable} → ${dstTable}: ${rows.length} rows → ${count} inserted`);
  }

  // ── STEP 4: Merge MySQL-only admins ───────────────────────────────────────
  log("\n── Merging MySQL-only admins ────────────────────────────────");
  if (mysqlOnlyAdmins.length === 0) {
    log("  No MySQL-only admins to add");
  } else {
    for (const admin of mysqlOnlyAdmins) {
      const inserted = await upsertRows("Admins", [admin], ["id"]);
      log(`  Inserted admin: ${admin.email} (id=${admin.id})`);
    }
  }

  // ── STEP 5: Restore FK checks ─────────────────────────────────────────────
  await mysql.query("SET FOREIGN_KEY_CHECKS = 1");

  // ── STEP 6: Verification ──────────────────────────────────────────────────
  log("\n════════════════════════════════════════════════════════════");
  log("  VERIFICATION — SQLite vs MySQL record counts");
  log("════════════════════════════════════════════════════════════\n");

  let allMatch = true;
  for (const { srcTable, dstTable, sqliteCount } of results) {
    const mysqlC = await mysqlCount(dstTable);
    const match = mysqlC === sqliteCount;
    if (!match) allMatch = false;
    const icon = match ? "✓" : "✗ MISMATCH";
    log(`  ${icon}  ${srcTable}: SQLite=${sqliteCount}  MySQL=${mysqlC}`);
  }

  // Check merged admins total
  const totalAdmins = await mysqlCount("Admins");
  const expectedAdmins = (await sqliteRows("Admins")).length + mysqlOnlyAdmins.length;
  const adminMatch = totalAdmins === expectedAdmins;
  if (!adminMatch) allMatch = false;
  log(`\n  Admins total: expected=${expectedAdmins}  MySQL=${totalAdmins} ${adminMatch ? "✓" : "✗ MISMATCH"}`);

  log("\n════════════════════════════════════════════════════════════");
  if (allMatch) {
    log("  ALL COUNTS MATCH — migration successful");
  } else {
    log("  WARNING: Some counts do not match — review above");
  }
  log("════════════════════════════════════════════════════════════\n");

  await sqlite.close();
  await mysql.close();

  return allMatch;
}

main().then(ok => {
  process.exit(ok ? 0 : 1);
}).catch(e => {
  console.error("\nFATAL:", e.message);
  console.error(e.stack);
  process.exit(1);
});
