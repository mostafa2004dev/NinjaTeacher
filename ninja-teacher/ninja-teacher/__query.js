const { sequelize } = require("./src/config/database");
sequelize.query("SELECT Teacher_ID, Name, Email, Role, Gender, Date_of_Birth, Years_of_Experience, Big5_Score FROM Teacher WHERE Role='teacher' LIMIT 5", { type: sequelize.QueryTypes.SELECT })
  .then(rows => { console.log(JSON.stringify(rows, null, 2)); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
