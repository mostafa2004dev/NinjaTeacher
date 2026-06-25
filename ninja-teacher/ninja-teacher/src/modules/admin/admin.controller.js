const adminAuthService = require("./admin.auth.service");
const adminUsersService = require("./admin.users.service");
const adminJobsService = require("./admin.jobs.service");
const adminSubsService = require("./admin.subscriptions.service");
const adminAdminsService = require("./admin.admins.service");
const dashService = require("./admin.dashboard.service");
const reviewsService = require("../reviews/reviews.service");

// ══════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });
  try {
    const result = await adminAuthService.loginAdmin(email, password);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    const code = err.message.includes("Invalid") ? 401 : 403;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const admin = await adminAuthService.getAdminProfile(req.admin.id);
    return res.status(200).json({ status: "success", data: admin });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// ── جديد: تعديل البروفايل الشخصي (اسم/إيميل) لأي أدمن مسجّل دخول ────────
exports.updateMyProfile = async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email)
    return res.status(400).json({ message: "Provide at least name or email to update." });
  try {
    const admin = await adminAuthService.updateOwnProfile(req.admin.id, { name, email });
    return res.status(200).json({ status: "success", data: admin });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 :
      err.message.includes("already used") ? 409 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password)
    return res.status(400).json({ message: "old_password and new_password are required." });
  try {
    const result = await adminAuthService.changeAdminPassword(req.admin.id, old_password, new_password);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════

exports.getOverviewStats = async (req, res) => {
  try {
    const stats = await dashService.getOverviewStats();
    return res.status(200).json({ status: "success", data: stats });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// USERS (المعلمين والمدارس)
// ══════════════════════════════════════════════════════════════════════════

exports.getAllUsers = async (req, res) => {
  try {
    const result = await adminUsersService.getAllUsers(req.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await adminUsersService.getUserById(req.params.userId);
    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "name, email, password, role are required." });
  try {
    const user = await adminUsersService.createUser(req.body);
    return res.status(201).json({ status: "success", data: user });
  } catch (err) {
    const code = err.message.includes("registered") ? 409 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await adminUsersService.updateUser(req.params.userId, req.body);
    return res.status(200).json({ status: "success", data: user });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 :
      err.message.includes("Email") ? 409 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await adminUsersService.deleteUser(req.params.userId);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 :
      err.message.includes("active subscription") ? 409 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  const { new_password } = req.body;
  if (!new_password)
    return res.status(400).json({ message: "new_password is required." });
  try {
    const result = await adminUsersService.resetUserPassword(req.params.userId, new_password);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await adminUsersService.getUserStats();
    return res.status(200).json({ status: "success", data: stats });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// JOBS & APPLICATIONS
// ══════════════════════════════════════════════════════════════════════════

exports.getAllJobs = async (req, res) => {
  try {
    const result = await adminJobsService.getAllJobs(req.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await adminJobsService.updateJob(req.params.schoolId, req.params.jobId, req.body);
    return res.status(200).json({ status: "success", data: job });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const result = await adminJobsService.deleteJob(req.params.schoolId, req.params.jobId);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const result = await adminJobsService.approveJob(req.params.id);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const result = await adminJobsService.rejectJob(req.params.id);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const result = await adminJobsService.getAllApplications(req.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  if (!status)
    return res.status(400).json({ message: "status is required." });
  try {
    const result = await adminJobsService.updateApplicationStatus(
      req.params.teacherId, req.params.jobId, status
    );
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS & PAYMENTS & PLANS
// ══════════════════════════════════════════════════════════════════════════

exports.getAllSubscriptions = async (req, res) => {
  try {
    const result = await adminSubsService.getAllSubscriptions(req.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const sub = await adminSubsService.getSubscriptionById(req.params.subId);
    return res.status(200).json({ status: "success", data: sub });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.forceActivateSubscription = async (req, res) => {
  try {
    const sub = await adminSubsService.forceActivateSubscription(
      req.params.subId, req.admin.name
    );
    return res.status(200).json({ status: "success", data: sub });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.cancelSubscriptionByAdmin = async (req, res) => {
  try {
    const sub = await adminSubsService.cancelSubscriptionByAdmin(
      req.params.subId, req.admin.name, req.body.reason
    );
    return res.status(200).json({ status: "success", data: sub });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.extendSubscription = async (req, res) => {
  const { extra_days } = req.body;
  if (!extra_days)
    return res.status(400).json({ message: "extra_days is required." });
  try {
    const sub = await adminSubsService.extendSubscription(
      req.params.subId, extra_days, req.admin.name
    );
    return res.status(200).json({ status: "success", data: sub });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.getSubscriptionStats = async (req, res) => {
  try {
    const stats = await adminSubsService.getSubscriptionStats();
    return res.status(200).json({ status: "success", data: stats });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const result = await adminSubsService.getAllPayments(req.query);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await adminSubsService.updatePlan(req.params.planId, req.body);
    return res.status(200).json({ status: "success", data: plan });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════
// ADMINS MANAGEMENT (super_admin فقط)
// ══════════════════════════════════════════════════════════════════════════

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await adminAdminsService.getAllAdmins();
    return res.status(200).json({ status: "success", data: admins });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "name, email, and password are required." });
  try {
    const admin = await adminAdminsService.createAdmin(req.body);
    return res.status(201).json({ status: "success", data: admin });
  } catch (err) {
    const code = err.message.includes("registered") ? 409 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await adminAdminsService.updateAdmin(
      req.params.adminId, req.body, req.admin.id
    );
    return res.status(200).json({ status: "success", data: admin });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const result = await adminAdminsService.deleteAdmin(req.params.adminId, req.admin.id);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 400;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// ── BUG 2 FIX: delete (soft-hide) a review ──────────────────────────────────
exports.deleteReview = async (req, res) => {
  try {
    const result = await reviewsService.deleteReview(req.params.reviewId);
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const code = err.message.includes("not found") ? 404 : 500;
    return res.status(code).json({ status: "fail", message: err.message });
  }
};

// ── BUG 1 FIX: run real AI matching engine for all applications ──────────────
exports.runAIMatching = async (req, res) => {
  try {
    const result = await adminJobsService.runAIMatchingForAllApplications();
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};