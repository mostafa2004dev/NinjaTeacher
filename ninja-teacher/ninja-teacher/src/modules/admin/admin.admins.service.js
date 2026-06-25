const bcrypt = require("bcryptjs");
const Admin  = require("./admin.model");

// ── getAllAdmins ───────────────────────────────────────────────────────────
async function getAllAdmins() {
  return await Admin.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "ASC"]],
  });
}

// ── createAdmin ───────────────────────────────────────────────────────────
// super_admin بس يقدر يضيف أدمن جديد
async function createAdmin({ name, email, password, role }) {
  const existing = await Admin.findOne({ where: { email } });
  if (existing) throw new Error("Email is already registered for an admin.");

  if (!password || password.length < 8) {
    throw new Error("Admin password must be at least 8 characters.");
  }

  const allowedRoles = ["super_admin", "moderator"];
  const adminRole = allowedRoles.includes(role) ? role : "moderator";

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(password, saltRounds);

  const admin = await Admin.create({
    name,
    email,
    password: hashed,
    role: adminRole,
  });

  const { password: _, ...safeAdmin } = admin.toJSON();
  return safeAdmin;
}

// ── updateAdmin ───────────────────────────────────────────────────────────
async function updateAdmin(adminId, updates, requestingAdminId) {
  const admin = await Admin.findByPk(adminId);
  if (!admin) throw new Error("Admin not found.");

  // الأدمن ميقدرش يغير role نفسه
  if (String(adminId) === String(requestingAdminId) && updates.role) {
    throw new Error("You cannot change your own role.");
  }

  if (updates.name)  admin.name  = updates.name;
  if (updates.email) {
    const exists = await Admin.findOne({ where: { email: updates.email } });
    if (exists && exists.id !== admin.id) throw new Error("Email already used.");
    admin.email = updates.email;
  }
  if (updates.role && ["super_admin", "moderator"].includes(updates.role)) {
    admin.role = updates.role;
  }
  if (typeof updates.is_active === "boolean") {
    // الأدمن ميقدرش يوقف نفسه
    if (String(adminId) === String(requestingAdminId)) {
      throw new Error("You cannot deactivate your own account.");
    }
    admin.is_active = updates.is_active;
  }

  await admin.save();

  const { password: _, ...safeAdmin } = admin.toJSON();
  return safeAdmin;
}

// ── deleteAdmin ───────────────────────────────────────────────────────────
async function deleteAdmin(adminId, requestingAdminId) {
  if (String(adminId) === String(requestingAdminId)) {
    throw new Error("You cannot delete your own admin account.");
  }

  const admin = await Admin.findByPk(adminId);
  if (!admin) throw new Error("Admin not found.");

  // ضمان إن في super_admin واحد على الأقل
  if (admin.role === "super_admin") {
    const superCount = await Admin.count({ where: { role: "super_admin", is_active: true } });
    if (superCount <= 1) {
      throw new Error("Cannot delete the last super_admin. Promote another admin first.");
    }
  }

  const name = admin.name;
  await admin.destroy();
  return { message: `Admin "${name}" has been deleted.` };
}

module.exports = { getAllAdmins, createAdmin, updateAdmin, deleteAdmin };
