const authService = require("./auth.service");
const { registrationUpload, getRegistrationCvFile } = require("../../middlewares/upload.middleware");

function runMiddleware(middleware, req, res) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

// POST /auth/register
// JSON body or multipart/form-data (fields + optional cv file)
async function register(req, res) {
  if (req.is("multipart/form-data")) {
    try {
      await runMiddleware(registrationUpload, req, res);
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message || "Invalid file upload.",
        errors: { cv: err.message },
      });
    }
  }

  const {
    name,
    email,
    password,
    confirm_password,
    role,
    gender: genderRaw,
    Gender: genderAlt,
    governorate, Governorate,
    city, City, location, Location,
    school_type, School_Type, type,
    teacher_stage,
  } = req.body;

  const userRole = ["teacher", "school"].includes(role) ? role : "teacher";

  // الجنس بس مطلوب للمدرس
  const gender = userRole === "teacher"
    ? authService.normalizeGender(genderRaw || genderAlt)
    : null;

  const cvUpload = getRegistrationCvFile(req);
  const cvFilePath = cvUpload ? `/uploads/cvs/${cvUpload.filename}` : null;

  if (!name || !email || !password || !confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "All fields are required.",
      errors: {
        name:             !name             ? "Name is required."             : null,
        email:            !email            ? "Email is required."            : null,
        password:         !password         ? "Password is required."         : null,
        confirm_password: !confirm_password ? "Please confirm your password." : null,
      },
    });
  }

  // التحقق من الجنس بس لو المستخدم مدرس
  if (userRole === "teacher" && !gender) {
    return res.status(400).json({
      status: "fail",
      message: "Valid gender is required.",
      errors: {
        gender: "Please select a valid gender (male, female, or other).",
      },
    });
  }

  if (userRole === "teacher" && !cvFilePath) {
    return res.status(400).json({
      status: "fail",
      message: "CV file is required for teacher registration.",
      errors: { cv: "Please upload your CV (pdf, doc, or docx)." },
    });
  }

  const VALID_STAGES = ["Kindergarten", "Primary School", "Middle School", "High School"];
  if (userRole === "teacher" && (!teacher_stage || !VALID_STAGES.includes(teacher_stage))) {
    return res.status(400).json({
      status: "fail",
      message: "Teaching stage is required.",
      errors: { teacher_stage: "Please select a valid teaching stage." },
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "Passwords do not match.",
      errors: { confirm_password: "Passwords do not match." },
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: "fail",
      message: "Password must be at least 6 characters.",
      errors: { password: "Password must be at least 6 characters." },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid email format.",
      errors: { email: "Please enter a valid email address." },
    });
  }

  try {
    const result = await authService.registerUser(name, email, password, userRole, {
      gender: userRole === "teacher" ? gender : null,
      cvFilePath,
      location: city || City || location || Location || null,
      governorate: governorate || Governorate || null,
      schoolType: school_type || School_Type || type || null,
      teacher_stage: userRole === "teacher" ? teacher_stage : null,
    });
    return res.status(201).json({
      status: "success",
      message: "Account created successfully.",
      data: result,
    });
  } catch (err) {
    if (err.message === "Email is already registered") {
      return res.status(409).json({
        status: "fail",
        message: "Email is already registered.",
        errors: { email: "This email is already in use." },
      });
    }
    return res.status(500).json({ status: "error", message: "Registration failed.", error: err.message });
  }
}

// POST /auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required.",
      errors: {
        email:    !email    ? "Email is required."    : null,
        password: !password ? "Password is required." : null,
      },
    });
  }
  try {
    const result = await authService.loginUser(email, password);
    return res.status(200).json({ status: "success", message: "Login successful.", data: result });
  } catch (err) {
    if (err.message === "Invalid email or password") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
        errors: { general: "The email or password you entered is incorrect." },
      });
    }
    return res.status(500).json({ status: "error", message: "Login failed.", error: err.message });
  }
}

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required.",
      errors: { email: "Email is required." },
    });
  }
  try {
    const result = await authService.forgotPassword(email);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Something went wrong." });
  }
}

// POST /auth/reset-password
async function resetPassword(req, res) {
  const { token, password, confirm_password } = req.body;
  if (!token || !password || !confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "token, password, and confirm_password are required.",
    });
  }
  if (password !== confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "Passwords do not match.",
      errors: { confirm_password: "Passwords do not match." },
    });
  }
  try {
    const result = await authService.resetPassword(token, password);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("expired") ? 410 :
                 err.message.includes("Invalid")  ? 400 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

// POST /auth/change-password
async function changePassword(req, res) {
  const { current_password, new_password, confirm_password } = req.body;
  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "current_password, new_password, and confirm_password are required.",
    });
  }
  if (new_password !== confirm_password) {
    return res.status(400).json({
      status: "fail",
      message: "New passwords do not match.",
      errors: { confirm_password: "New passwords do not match." },
    });
  }
  try {
    const result = await authService.changePassword(req.user.Teacher_ID, current_password, new_password);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("incorrect") ? 401 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
}

function logout(req, res) {
  return res.status(200).json({
    status: "success",
    message: "Logged out successfully. Please clear your local token.",
  });
}

// POST /auth/google  — تسجيل دخول/حساب عبر جوجل
const googleAuth = async (req, res) => {
  try {
    const { credential, token, role, governorate, city, school_type } = req.body;
    const idToken = credential || token;
    const result = await authService.googleAuth(idToken, role, {
      governorate, location: city, schoolType: school_type,
    });
    return res.status(200).json({
      status: "success",
      message: result.isNew ? "Account created via Google." : "Logged in via Google.",
      data: result,
    });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, changePassword, logout, googleAuth };
