const jwt = require("jsonwebtoken");

// للمعلمين والمدارس — type: "user"
function generateToken(userId, role = "teacher") {
  return jwt.sign(
    { id: userId, role, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// للأدمن فقط — type: "admin" عشان الـ middleware يفرق بينهم
function generateAdminToken(adminId, adminRole = "moderator") {
  return jwt.sign(
    { id: adminId, role: adminRole, type: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "8h" }
  );
}

module.exports = { generateToken, generateAdminToken };
