/**
 * run once:  node fix-saved-jobs-table.js
 * بيعمل جدول SavedJobs لو مش موجود
 */

const { sequelize } = require("./src/config/database");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`SavedJobs\` (
        \`id\`         INTEGER PRIMARY KEY AUTOINCREMENT,
        \`Teacher_ID\` INTEGER NOT NULL,
        \`School_ID\`  INTEGER NOT NULL,
        \`Job_ID\`     INTEGER NOT NULL,
        \`createdAt\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (\`Teacher_ID\`, \`School_ID\`, \`Job_ID\`)
      );
    `);
    console.log("✅ SavedJobs table created (or already exists)");

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_savedjobs_teacher ON \`SavedJobs\` (\`Teacher_ID\`);
    `);
    console.log("✅ Index created");

    console.log("\n🎉 Done! Now run: npm run dev");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
