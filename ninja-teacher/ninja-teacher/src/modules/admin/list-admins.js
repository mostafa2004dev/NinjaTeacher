require("dotenv").config({ path: "../../../.env" });
const Admin = require("./admin.model");

Admin.findAll({ attributes: ["id", "name", "email", "role", "is_active"] })
  .then(admins => {
    console.log(JSON.stringify(admins.map(a => a.toJSON()), null, 2));
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
