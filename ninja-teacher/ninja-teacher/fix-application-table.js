/**
 * run once:  node fix-application-table.js
 * يحذف جدول Application القديم اللي فيه unique constraint غلط
 * ويعيد إنشاؤه صح بـ composite PK (Teacher_ID + School_ID + Job_ID)
 */

const { sequelize } = require("./src/config/database");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    // حذف الجدول القديم
    await sequelize.query("DROP TABLE IF EXISTS `Application`;");
    console.log("🗑️  Old Application table dropped");

    // إعادة إنشاء الجدول صح
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`Application\` (
        \`Teacher_ID\`  INTEGER NOT NULL,
        \`School_ID\`   INTEGER NOT NULL,
        \`Job_ID\`      INTEGER NOT NULL,
        \`Apply_Date\`  DATE,
        \`Big5_Score\`  DECIMAL(5,2),
        \`Status\`      TEXT NOT NULL DEFAULT 'pending'
                        CHECK(\`Status\` IN ('pending','shortlisted','interview','accepted','rejected')),
        PRIMARY KEY (\`Teacher_ID\`, \`School_ID\`, \`Job_ID\`)
      );
    `);
    console.log("✅ Application table recreated with correct composite PK");

    // indexes
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_app_school_job    ON \`Application\` (\`School_ID\`, \`Job_ID\`);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_app_teacher        ON \`Application\` (\`Teacher_ID\`);`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_app_status         ON \`Application\` (\`Status\`);`);
    console.log("✅ Indexes created");

    console.log("\n🎉 Done! Now run: npm run dev");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
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
console.log("✅ SavedJobs table created");

await sequelize.query(`
  CREATE INDEX IF NOT EXISTS idx_savedjobs_teacher ON \`SavedJobs\` (\`Teacher_ID\`);
`);
console.log("✅ SavedJobs index created");