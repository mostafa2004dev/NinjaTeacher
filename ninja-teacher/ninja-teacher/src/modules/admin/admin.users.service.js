const bcrypt   = require("bcryptjs");
const { Op }   = require("sequelize");
const Teacher  = require("../users/users.model");
const Subscription = require("../subscriptions/subscription.model");
const SubscriptionPlan = require("../subscriptions/subscriptionPlan.model");
const AppliedJob = require("../appliedJobs/appliedJobs.model");
const Notification = require("../notifications/notifications.model");

// ── getAllUsers ───────────────────────────────────────────────────────────
// بيجيب كل المعلمين والمدارس مع فلترة وبحث وباجينيشن
async function getAllUsers({ role, search, page = 1, limit = 20 }) {
  const where = {};

  if (role && ["teacher", "school"].includes(role)) {
    where.Role = role;
  }

  if (search) {
    where[Op.or] = [
      { Name:  { [Op.like]: `%${search}%` } },
      { Email: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Teacher.findAndCountAll({
    where,
    attributes: { exclude: ["Password"] },
    order: [["Teacher_ID", "DESC"]],
    limit:  parseInt(limit),
    offset,
  });

  return {
    total:       count,
    page:        parseInt(page),
    total_pages: Math.ceil(count / parseInt(limit)),
    users:       rows,
  };
}

// ── getUserById ───────────────────────────────────────────────────────────
// بيجيب يوزر واحد بالتفصيل + اشتراكاته + تقديماته
async function getUserById(userId) {
  const user = await Teacher.findByPk(userId, {
    attributes: { exclude: ["Password"] },
    include: [
      {
        model: Subscription,
        as: "Subscriptions",
        include: [{ model: SubscriptionPlan, as: "Plan" }],
        order: [["createdAt", "DESC"]],
        limit: 5,
      },
    ],
  });

  if (!user) throw new Error("User not found.");

  // إحصائيات إضافية
  const applications_count = await AppliedJob.count({ where: { Teacher_ID: userId } });
  const notifications_count = await Notification.count({ where: { Teacher_ID: userId } });

  return { ...user.toJSON(), applications_count, notifications_count };
}

// ── createUser ────────────────────────────────────────────────────────────
// الأدمن يضيف معلم أو مدرسة جديدة
async function createUser({ name, email, password, role, phone, specialization, teacher_stage, years_of_experience, qualifications, gender }) {
  const existing = await Teacher.findOne({ where: { Email: email } });
  if (existing) throw new Error("Email is already registered.");

  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

  const allowedRoles = ["teacher", "school"];
  if (!allowedRoles.includes(role)) throw new Error(`Role must be one of: ${allowedRoles.join(", ")}`);

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(password, saltRounds);

  const user = await Teacher.create({
    Name:                name,
    Email:               email,
    Password:            hashed,
    Role:                role,
    Phone:               phone               || null,
    Specialization:      specialization      || null,
    Teacher_Stage:       teacher_stage       || null,
    Years_of_Experience: years_of_experience || 0,
    Qualifications:      qualifications      || null,
    Gender:              gender              || null,
  });

  const { Password: _, ...safeUser } = user.toJSON();
  return safeUser;
}

// ── updateUser ────────────────────────────────────────────────────────────
// الأدمن يعدل أي بيانات على أي يوزر
async function updateUser(userId, updates) {
  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");

  // الحقول اللي يقدر الأدمن يعدلها
  const allowed = [
    "Name", "Email", "Phone", "Date_of_Birth", "Gender",
    "Qualifications", "Specialization", "Teacher_Stage", "Years_of_Experience",
    "Big5_Score", "Role", "Image",
  ];

  // لو الأدمن بعت باسورد جديد هنعمله hash
  if (updates.password) {
    if (updates.password.length < 6) throw new Error("Password must be at least 6 characters.");
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.Password = await bcrypt.hash(updates.password, saltRounds);
  }

  // لو الإيميل اتغير نتحقق إنه مش مكرر
  if (updates.Email && updates.Email !== user.Email) {
    const emailExists = await Teacher.findOne({ where: { Email: updates.Email } });
    if (emailExists) throw new Error("Email is already used by another account.");
  }

  // طبّق التعديلات على الحقول المسموح بيها بس
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  }

  await user.save();

  const { Password: _, ...safeUser } = user.toJSON();
  return safeUser;
}

// ── deleteUser ────────────────────────────────────────────────────────────
// الحذف الكامل — super_admin بس
// بيحذف اليوزر وكل بياناته (cascade في الـ DB)
async function deleteUser(userId) {
  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");

  // امنع الحذف لو في اشتراك active
  const activeSub = await Subscription.findOne({
    where: { user_id: userId, status: "active" },
  });
  if (activeSub) {
    throw new Error(
      "Cannot delete user with an active subscription. Cancel the subscription first."
    );
  }

  const name  = user.Name;
  const email = user.Email;
  await user.destroy();

  return { message: `User "${name}" (${email}) has been permanently deleted.` };
}

// ── resetUserPassword ─────────────────────────────────────────────────────
// الأدمن يعمل reset لباسورد أي يوزر من غير ما يعرف الباسورد القديم
async function resetUserPassword(userId, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }

  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  user.Password = await bcrypt.hash(newPassword, saltRounds);
  await user.save();

  return { message: `Password reset successfully for user "${user.Name}".` };
}

// ── getUserStats ──────────────────────────────────────────────────────────
// إحصائيات عامة للداشبورد الأدمن
async function getUserStats() {
  const [total, teachers, schools] = await Promise.all([
    Teacher.count(),
    Teacher.count({ where: { Role: "teacher" } }),
    Teacher.count({ where: { Role: "school"  } }),
  ]);

  return { total, teachers, schools };
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
};
