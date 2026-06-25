const { sequelize } = require("./src/config/database");
async function main() {
  const [teachers] = await sequelize.query("SELECT COUNT(*) as c FROM Teacher WHERE Role='teacher'");
  const [schools]  = await sequelize.query("SELECT COUNT(*) as c FROM Teacher WHERE Role='school'");
  const [posts]    = await sequelize.query("SELECT COUNT(*) as c FROM Post");
  const [apps]     = await sequelize.query("SELECT COUNT(*) as c FROM Application");
  const [reviews]  = await sequelize.query("SELECT COUNT(*) as c FROM Reviews");
  const [scored]   = await sequelize.query("SELECT COUNT(*) as c FROM Teacher WHERE Big5_Score IS NOT NULL");
  const [assess]   = await sequelize.query("SELECT id,status,decision,raw_score,teacher_id FROM Assessments ORDER BY id DESC LIMIT 5");
  const [appDetail]= await sequelize.query("SELECT a.Teacher_ID, a.Job_ID, a.Status, t.Big5_Score FROM Application a JOIN Teacher t ON a.Teacher_ID=t.Teacher_ID WHERE a.Teacher_ID=17");
  const [notifs]   = await sequelize.query("SELECT COUNT(*) as c FROM Notifications");
  console.log(JSON.stringify({
    teachers:teachers[0].c, schools:schools[0].c, job_posts:posts[0].c,
    applications:apps[0].c, reviews:reviews[0].c,
    teachers_with_big5_score: scored[0].c,
    notifications: notifs[0].c,
    recent_assessments: assess,
    qa_teacher_applications: appDetail
  }, null, 2));
  process.exit(0);
}
main().catch(e=>{console.error(e.message);process.exit(1);});
