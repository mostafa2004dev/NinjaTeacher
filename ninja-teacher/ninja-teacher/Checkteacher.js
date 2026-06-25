const { sequelize } = require("./src/config/database");

async function check() {
  await sequelize.authenticate();
  console.log("✅ Connected\n");

  // 1) صفوف Teacher_ID فاضية (NULL)
  const [nulls] = await sequelize.query(
    `SELECT * FROM Teacher WHERE Teacher_ID IS NULL`
  );
  console.log("── صفوف Teacher_ID = NULL ──");
  console.log("العدد:", nulls.length);
  console.log(nulls);

  // 2) Teacher_ID متكررة
  const [dupes] = await sequelize.query(
    `SELECT Teacher_ID, COUNT(*) as count FROM Teacher GROUP BY Teacher_ID HAVING COUNT(*) > 1`
  );
  console.log("\n── Teacher_ID متكررة ──");
  console.log("العدد:", dupes.length);
  console.log(dupes);

  // 3) إجمالي عدد الصفوف في الجدول (للمقارنة)
  const [[{ total }]] = await sequelize.query(`SELECT COUNT(*) as total FROM Teacher`);
  console.log("\nإجمالي صفوف Teacher:", total);

  process.exit(0);
}

check().catch(e => { console.error("❌ Error:", e); process.exit(1); });