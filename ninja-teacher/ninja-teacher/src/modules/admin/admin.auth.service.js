// admin.auth.service.js — أُعيدت كتابته بعد تلف RAR
// متوافقة مع admin.controller: loginAdmin, getAdminProfile, changeAdminPassword, updateOwnProfile
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const Admin  = require("./admin.model");

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const TOKEN_TTL  = process.env.ADMIN_TOKEN_TTL || "1d";

function signAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, type: "admin" },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

async function loginAdmin(email, password) {
  if (!email || !password) throw new Error("Email and password are required.");
  const admin = await Admin.findOne({ where: { email: String(email).toLowerCase().trim() } });
  if (!admin) throw new Error("Invalid credentials.");
  if (admin.is_active === false) throw new Error("This admin account is disabled.");

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) throw new Error("Invalid credentials.");

  if ("last_login" in admin) { admin.last_login = new Date(); await admin.save(); }

  const token = signAdminToken(admin);
  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  };
}

async function getAdminProfile(adminId) {
  const admin = await Admin.findByPk(adminId, { attributes: { exclude: ["password"] } });
  if (!admin) throw new Error("Admin not found.");
  return admin;
}

async function changeAdminPassword(adminId, oldPassword, newPassword) {
  if (!oldPassword || !newPassword) throw new Error("Old and new passwords are required.");
  if (String(newPassword).length < 6) throw new Error("New password must be at least 6 characters.");

  const admin = await Admin.findByPk(adminId);
  if (!admin) throw new Error("Admin not found.");

  const ok = await bcrypt.compare(oldPassword, admin.password);
  if (!ok) throw new Error("Old password is incorrect.");

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();
  return { message: "Password changed successfully." };
}

// ── updateOwnProfile ─────────────────────────────────────────────────────
// إضافة جديدة: أي أدمن (مش لازم super_admin) يقدر يعدل اسمه/إيميله بنفسه.
// ده مختلف عن admin.admins.service > updateAdmin اللي بتديره super_admin
// على أدمنز تانيين (وممنوعة تغيّر role/is_active بتاعه هو نفسه).
async function updateOwnProfile(adminId, { name, email }) {
  const admin = await Admin.findByPk(adminId);
  if (!admin) throw new Error("Admin not found.");

  if (name && String(name).trim()) admin.name = String(name).trim();

  if (email && email !== admin.email) {
    const exists = await Admin.findOne({ where: { email } });
    if (exists && exists.id !== admin.id) throw new Error("Email already used.");
    admin.email = email;
  }

  await admin.save();

  const { password: _, ...safeAdmin } = admin.toJSON();
  return safeAdmin;
}

module.exports = { loginAdmin, getAdminProfile, changeAdminPassword, updateOwnProfile };