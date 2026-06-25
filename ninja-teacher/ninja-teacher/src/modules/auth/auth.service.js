const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Teacher = require("../users/users.model");
const { generateToken } = require("../../utils/jwt.util");

// ── formatAuthUser ─────────────────────────────────────────────────────────
function formatAuthUser(user) {
  const u = user.get ? user.get({ plain: true }) : user;

  // fields مشتركة بين المدرس والمدرسة
  const base = {
    id: u.Teacher_ID,
    name: u.Name,
    email: u.Email,
    role: u.Role,
    image: u.Image ?? null,
    phone: u.Phone ?? null,
    bio: u.Bio ?? null,
    location: u.Location ?? null,
    nationality: u.Nationality ?? null,
    profile_completion: u.Profile_Completion ?? 0,
    linkedin_url: u.LinkedIn_URL ?? null,
    website_url: u.Website_URL ?? null,
    average_rating: u.Average_Rating ?? 0,
    total_reviews: u.Total_Reviews ?? 0,
  };

  if (u.Role === "school") {
    return {
      ...base,
      school_name: u.School_Name ?? null,
      school_type: u.School_Type ?? null,
      school_size: u.School_Size ?? null,
    };
  }

  // teacher
  return {
    ...base,
    gender: u.Gender ?? null,
    cv: u.CV_File ?? null,
    cv_url: u.CV_File ?? null,
    date_of_birth: u.Date_of_Birth ?? null,
    qualifications: u.Qualifications ?? null,
    specialization: u.Specialization ?? null,
    teacher_stage: u.Teacher_Stage ?? null,
    years_of_experience: u.Years_of_Experience ?? 0,
    is_available: u.Is_Available ?? true,
    job_type_preference: u.Job_Type_Preference ?? null,
    expected_salary: u.Expected_Salary ?? null,
    evaluationScore: u.Big5_Score ?? null,
    survey_submitted_at: u.Survey_Submitted_At ?? null,
  };
}

function normalizeGender(gender) {
  if (!gender || typeof gender !== "string") return null;
  const g = gender.trim().toLowerCase();
  const allowed = ["male", "female", "other"];
  return allowed.includes(g) ? g : null;
}

// ── registerUser ───────────────────────────────────────────────────────────
async function registerUser(name, email, password, role = "teacher", options = {}) {
  const { gender, cvFilePath, location, governorate, schoolType, teacher_stage } = options;

  const existing = await Teacher.findOne({ where: { Email: email } });
  if (existing) throw new Error("Email is already registered");

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(password, saltRounds);

  const user = await Teacher.create({
    Name:     name,
    Email:    email,
    Password: hashed,
    Role:     role,
    Gender:   gender,
    CV_File:  cvFilePath || null,
    Location: location || null,
    // نخزّن المحافظة داخل الملاحظات لو مفيش عمود مخصّص، والنوع في School_Type
    School_Type: role === "school" ? (schoolType || null) : null,
    ...(governorate ? { Governorate: governorate } : {}),
    ...(role === "teacher" && teacher_stage ? { Teacher_Stage: teacher_stage } : {}),
  });

  const token = generateToken(user.Teacher_ID, user.Role);

  return {
    token,
    user: formatAuthUser(user),
  };
}

// ── loginUser ──────────────────────────────────────────────────────────────
async function loginUser(email, password) {
  const user = await Teacher.findOne({ where: { Email: email } });
  if (!user) throw new Error("Invalid email or password");

  const ok = await bcrypt.compare(password, user.Password);
  if (!ok) throw new Error("Invalid email or password");

  const token = generateToken(user.Teacher_ID, user.Role);

  return {
    token,
    user: formatAuthUser(user),
  };
}

// ── forgotPassword ─────────────────────────────────────────────────────────
async function forgotPassword(email) {
  const user = await Teacher.findOne({ where: { Email: email } });

  const successMsg = "If this email exists, a reset link has been sent.";

  if (!user) return { message: successMsg };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await Teacher.update(
    { Reset_Token: hashedToken, Reset_Token_Expiry: expiry },
    { where: { Teacher_ID: user.Teacher_ID } }
  );

  // NOTE: In production, send rawToken via email instead of logging it.
  // Email integration is not yet wired; in dev mode only, log the expiry (not the token).
  if (process.env.NODE_ENV !== "production") {
    console.log(`[PASSWORD RESET] Token issued for ${email}, expires ${expiry.toISOString()}`);
  }

  return { message: successMsg };
}

// ── resetPassword ──────────────────────────────────────────────────────────
async function resetPassword(rawToken, newPassword) {
  if (!rawToken || !newPassword) {
    throw new Error("Token and new password are required.");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await Teacher.findOne({
    where: { Reset_Token: hashedToken },
  });

  if (!user) throw new Error("Invalid or expired reset token.");

  if (!user.Reset_Token_Expiry || new Date() > user.Reset_Token_Expiry) {
    await Teacher.update(
      { Reset_Token: null, Reset_Token_Expiry: null },
      { where: { Teacher_ID: user.Teacher_ID } }
    );
    throw new Error("Reset token has expired. Please request a new one.");
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(newPassword, saltRounds);

  await Teacher.update(
    { Password: hashed, Reset_Token: null, Reset_Token_Expiry: null },
    { where: { Teacher_ID: user.Teacher_ID } }
  );

  return { message: "Password reset successfully. Please login with your new password." };
}

// ── changePassword ─────────────────────────────────────────────────────────
async function changePassword(userId, currentPassword, newPassword) {
  const user = await Teacher.findByPk(userId);
  if (!user) throw new Error("User not found.");

  const ok = await bcrypt.compare(currentPassword, user.Password);
  if (!ok) throw new Error("Current password is incorrect.");

  if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");
  if (currentPassword === newPassword) throw new Error("New password must differ from current password.");

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(newPassword, saltRounds);

  user.Password = hashed;
  await user.save();

  return { message: "Password changed successfully." };
}

// ── تسجيل الدخول/الحساب عبر Google ──────────────────────────────────────
// بياخد الـ idToken اللي رجع من جوجل في الفرونت، يتحقق منه، وبعدين:
//  • لو الإيميل موجود → يسجّل دخوله
//  • لو جديد → يعمل حساب جديد (بدور role: teacher افتراضيًا، أو زي ما يتبعت)
async function googleAuth(idToken, role = "teacher", extra = {}) {
  if (!idToken) throw new Error("Google token is required");

  const { OAuth2Client } = require("google-auth-library");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured on the server");

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch (e) {
    throw new Error("Invalid Google token");
  }

  const email = payload.email;
  const name  = payload.name || email.split("@")[0];
  if (!email) throw new Error("Google account has no email");

  let user = await Teacher.findOne({ where: { Email: email } });
  let isNew = false;

  if (!user) {
    // حساب جديد عبر جوجل (بباسورد عشوائي مش هيُستخدم)
    const bcrypt = require("bcryptjs");
    const randomPass = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10);
    const userRole = ["teacher", "school"].includes(role) ? role : "teacher";
    user = await Teacher.create({
      Name: name,
      Email: email,
      Password: randomPass,
      Role: userRole,
      Auth_Provider: "google",
      ...(extra.location ? { Location: extra.location } : {}),
      ...(extra.governorate ? { Governorate: extra.governorate } : {}),
      ...(userRole === "school" && extra.schoolType ? { School_Type: extra.schoolType } : {}),
    });
    isNew = true;
  }

  const token = generateToken(user.Teacher_ID, user.Role);
  return { token, isNew, user: formatAuthUser(user) };
}
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  formatAuthUser,
  normalizeGender,
  googleAuth,
};
