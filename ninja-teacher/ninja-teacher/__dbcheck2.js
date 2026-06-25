
const { sequelize } = require("./src/config/database");
sequelize.query("SELECT aj.Teacher_ID, aj.Job_ID, aj.Status, aj.Big5_Score, t.Big5_Score as teacher_score FROM Applied_Jobs aj JOIN Teacher t ON aj.Teacher_ID=t.Teacher_ID WHERE aj.Teacher_ID=17", {type: sequelize.QueryTypes.SELECT})
  .then(r=>{ console.log(JSON.stringify(r,null,2)); process.exit(0); })
  .catch(e=>{ console.error(e.message); process.exit(1); });

