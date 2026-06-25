/**
 * Migration Pass 2 — fix the 8 tables that failed in pass 1.
 * Correct model paths + raw-SQL creation for inline-defined models.
 */
"use strict";
process.chdir(__dirname);
require("dotenv").config();

const { Sequelize } = require("sequelize");

const sqlite = new Sequelize({ dialect: "sqlite", storage: "./ninja_teacher.sqlite", logging: false });
const mysql  = new Sequelize("school_jobs", "root", "", {
  host: "localhost", port: 3306, dialect: "mysql", logging: false,
  dialectOptions: { connectTimeout: 10000 },
});

function escVal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

async function upsert(table, rows, pks) {
  if (!rows.length) { console.log(`  ${table}: 0 rows — skipped`); return 0; }
  const cols = Object.keys(rows[0]);
  const updateCols = cols.filter(c => !pks.includes(c));
  let ok = 0;
  for (const row of rows) {
    const vals = cols.map(c => escVal(row[c])).join(", ");
    const upd = updateCols.length
      ? "ON DUPLICATE KEY UPDATE " + updateCols.map(c => `\`${c}\`=VALUES(\`${c}\`)`).join(", ")
      : `ON DUPLICATE KEY UPDATE \`${pks[0]}\`=\`${pks[0]}\``;
    try {
      await mysql.query(`INSERT INTO \`${table}\` (\`${cols.join("`,`")}\`) VALUES (${vals}) ${upd}`);
      ok++;
    } catch(e) {
      console.warn(`  WARN ${table}: ${e.message.substring(0,100)}`);
      console.warn(`  Row: ${JSON.stringify(row).substring(0,150)}`);
    }
  }
  return ok;
}

async function sqliteRows(table) {
  try {
    const [rows] = await sqlite.query(`SELECT * FROM "${table}"`);
    return rows;
  } catch(e) { console.warn(`  SQLite "${table}" not found`); return []; }
}

async function main() {
  await sqlite.authenticate();
  await mysql.authenticate();
  console.log("✓ Both DBs connected\n");
  await mysql.query("SET FOREIGN_KEY_CHECKS = 0");

  // ── 1. Load correct model paths so Sequelize creates missing tables ─────────
  const dbModule = require("./src/config/database");
  dbModule.sequelize = mysql;

  const modelPaths = [
    "./src/modules/subscriptions/subscriptionPlan.model",
    "./src/modules/payments/payment.model",
    "./src/modules/payments/invoice.model",
    "./src/modules/profile/profile.model",   // WorkExperience, Education, Certifications
  ];
  for (const mp of modelPaths) {
    try { require(mp); console.log(`  Loaded: ${mp}`); }
    catch(e) { console.warn(`  WARN model not found: ${mp} — ${e.message.substring(0,60)}`); }
  }

  // ── 2. SavedJobs & Matches — defined inline in service files, create raw SQL ──
  await mysql.query(`
    CREATE TABLE IF NOT EXISTS \`SavedJobs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`Teacher_ID\` INT,
      \`School_ID\`  INT,
      \`Job_ID\`     INT,
      \`createdAt\`  DATETIME,
      \`updatedAt\`  DATETIME,
      UNIQUE KEY \`saved_unique\` (\`Teacher_ID\`, \`School_ID\`, \`Job_ID\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("  Created: SavedJobs");

  await mysql.query(`
    CREATE TABLE IF NOT EXISTS \`Matches\` (
      \`id\`         INT AUTO_INCREMENT PRIMARY KEY,
      \`teacher_id\` INT,
      \`school_id\`  INT,
      \`job_id\`     INT,
      \`score\`      INT,
      \`insight\`    TEXT,
      \`tags\`       LONGTEXT,
      \`status\`     VARCHAR(50),
      \`createdAt\`  DATETIME,
      \`updatedAt\`  DATETIME
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log("  Created: Matches");

  // Sync newly loaded models (creates SubscriptionPlans, Payments, Invoices, WorkExperience, Education, Certifications)
  await mysql.sync({ force: false });
  console.log("  Synced new models to MySQL\n");

  // ── 3. Insert data ──────────────────────────────────────────────────────────
  console.log("── Inserting data ───────────────────────────────────────────");

  const tasks = [
    ["SubscriptionPlans", "SubscriptionPlans", ["id"]],
    ["SavedJobs",         "SavedJobs",         ["id"]],
    ["Certifications",    "Certifications",    ["id"]],
    ["Education",         "Education",         ["id"]],
    ["WorkExperience",    "WorkExperience",    ["id"]],
    ["Matches",           "Matches",           ["id"]],
  ];

  const results = [];
  for (const [src, dst, pks] of tasks) {
    const rows = await sqliteRows(src);
    const n = await upsert(dst, rows, pks);
    results.push({ src, dst, sqliteCount: rows.length, mysqlInserted: n });
    console.log(`  ${src} → ${dst}: ${rows.length} rows → ${n} inserted`);
  }

  // Also handle Payments and Invoices (model files use different table names)
  for (const [src, dst, pks] of [["Payments","Payments",["id"]], ["Invoices","Invoices",["id"]]]) {
    const rows = await sqliteRows(src);
    const n = await upsert(dst, rows, pks);
    results.push({ src, dst, sqliteCount: rows.length, mysqlInserted: n });
    console.log(`  ${src} → ${dst}: ${rows.length} rows → ${n} inserted`);
  }

  await mysql.query("SET FOREIGN_KEY_CHECKS = 1");

  // ── 4. Full verification ────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════════════════════");
  console.log("  FINAL VERIFICATION — all tables");
  console.log("════════════════════════════════════════════════════════════\n");

  const allTables = [
    ["Teacher", "Teacher"],
    ["Admins", "Admins"],
    ["SubscriptionPlans", "SubscriptionPlans"],
    ["Post", "Post"],
    ["Application", "Application"],
    ["Assessments", "Assessments"],
    ["Reviews", "Reviews"],
    ["Notifications", "Notifications"],
    ["Messages", "Messages"],
    ["Matches", "Matches"],
    ["Subscriptions", "Subscriptions"],
    ["Payments", "Payments"],
    ["Invoices", "Invoices"],
    ["SavedJobs", "SavedJobs"],
    ["Certifications", "Certifications"],
    ["Education", "Education"],
    ["WorkExperience", "WorkExperience"],
    ["ContactMessages", "ContactMessages"],
  ];

  let allOk = true;
  for (const [src, dst] of allTables) {
    const sRows = await sqliteRows(src);
    const [mRows] = await mysql.query(`SELECT COUNT(*) as cnt FROM \`${dst}\``);
    const sCount = sRows.length;
    const mCount = Number(mRows[0].cnt);

    // Admins: MySQL should have SQLite count + 2 merged admins
    const expected = src === "Admins" ? sCount + 2 : sCount;
    const match = mCount === expected;
    if (!match) allOk = false;
    const icon = match ? "✓" : "✗";
    const note = src === "Admins" ? ` (SQLite=${sCount} + 2 merged = ${expected})` : "";
    console.log(`  ${icon}  ${src}: SQLite=${sCount}  MySQL=${mCount}${note}`);
  }

  console.log("\n" + (allOk
    ? "  ✓ ALL COUNTS MATCH — migration complete"
    : "  ✗ WARNING: mismatches found above"));
  console.log("════════════════════════════════════════════════════════════\n");

  await sqlite.close();
  await mysql.close();
  return allOk;
}

main().then(ok => process.exit(ok ? 0 : 1)).catch(e => {
  console.error("FATAL:", e.message, e.stack);
  process.exit(1);
});
