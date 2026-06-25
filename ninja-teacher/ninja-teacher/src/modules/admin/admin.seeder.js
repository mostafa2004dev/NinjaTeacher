const bcrypt = require("bcryptjs");
const Admin = require("./admin.model");

// ── seedAdmin ─────────────────────────────────────────────────────────────────
// بيعمل أول super_admin لو مفيش أي أدمن في الـ DB
// بيشتغل أوتوماتيك عند بداية السيرفر
// credentials بتيجي من الـ .env — لازم تغيرهم قبل الـ production
async function seedAdmin() {
  try {
    const count = await Admin.count();
    if (count > 0) {
      console.log("✅ Admin already exists — skipping seed.");
      return;
    }

    const email    = process.env.ADMIN_DEFAULT_EMAIL    || "admin@ninjateacher.com";
    const password = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@1234";
    const name     = process.env.ADMIN_DEFAULT_NAME     || "Super Admin";

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    await Admin.create({
      name,
      email,
      password: hashed,
      role: "super_admin",
    });

    console.log(`✅ Default super_admin created → email: ${email}`);
    console.log(`⚠️  Change the default admin password immediately via POST /admin/auth/change-password`);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err.message);
  }
}

module.exports = { seedAdmin };
