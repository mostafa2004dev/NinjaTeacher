const { sequelize } = require("./src/config/database");
sequelize.query("SELECT Teacher_ID, Name, Big5_Score, Big5_Scores FROM Teacher WHERE Teacher_ID=2", 
  { type: sequelize.QueryTypes.SELECT })
  .then(rows => { console.log(JSON.stringify(rows, null, 2)); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
