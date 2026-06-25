const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { id: 2, role: "teacher", type: "user" },
  "dev_secret_change_me_0123456789abcdef",
  { expiresIn: "7d" }
);
console.log(token);
