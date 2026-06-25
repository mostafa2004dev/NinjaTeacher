const express = require("express");
const router = express.Router();
const ctrl = require("./admin.controller");
const { protectAdmin, requireSuperAdmin } = require("../../middlewares/auth.middleware");

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC — مفيش auth (login بس)
// ══════════════════════════════════════════════════════════════════════════
router.post("/auth/login", ctrl.login);

// ══════════════════════════════════════════════════════════════════════════
// PROTECTED — كل الروتس دي تحت protectAdmin
// ══════════════════════════════════════════════════════════════════════════
router.use(protectAdmin);

// ── الأدمن بروفايله ──────────────────────────────────────────────────────
router.get("/auth/me", ctrl.getMyProfile);
router.patch("/auth/profile", ctrl.updateMyProfile); // جديد: تعديل الاسم/الإيميل الشخصي
router.post("/auth/change-password", ctrl.changePassword);

// ── داشبورد عام ──────────────────────────────────────────────────────────
router.get("/dashboard", ctrl.getOverviewStats);

// ── المعلمين والمدارس ─────────────────────────────────────────────────────
// GET  /admin/users?role=teacher&search=ahmed&page=1&limit=20
router.get("/users", ctrl.getAllUsers);
router.get("/users/stats", ctrl.getUserStats);
router.get("/users/:userId", ctrl.getUserById);
router.post("/users", ctrl.createUser);
router.put("/users/:userId", ctrl.updateUser);
router.patch("/users/:userId/reset-password", ctrl.resetUserPassword);
// حذف يوزر — super_admin بس
router.delete("/users/:userId", requireSuperAdmin, ctrl.deleteUser);

// ── stats alias (used by Admin dashboard) ────────────────────────────────
router.get("/stats", ctrl.getOverviewStats);

// ── الوظايف ───────────────────────────────────────────────────────────────
// GET  /admin/jobs?search=math&page=1
router.get("/jobs", ctrl.getAllJobs);
router.put("/jobs/:schoolId/:jobId", ctrl.updateJob);
router.delete("/jobs/:schoolId/:jobId", requireSuperAdmin, ctrl.deleteJob);
router.patch("/posts/:id/approve", ctrl.approveJob);
router.patch("/posts/:id/reject", ctrl.rejectJob);

// ── التقديمات ─────────────────────────────────────────────────────────────
// GET  /admin/applications?status=pending&page=1
router.get("/applications", ctrl.getAllApplications);
router.patch("/applications/:teacherId/:jobId/status", ctrl.updateApplicationStatus);

// ── الاشتراكات ────────────────────────────────────────────────────────────
// GET  /admin/subscriptions?status=active&page=1
router.get("/subscriptions", ctrl.getAllSubscriptions);
router.get("/subscriptions/stats", ctrl.getSubscriptionStats);
router.get("/subscriptions/:subId", ctrl.getSubscriptionById);
router.patch("/subscriptions/:subId/activate", ctrl.forceActivateSubscription);
router.patch("/subscriptions/:subId/cancel", ctrl.cancelSubscriptionByAdmin);
router.patch("/subscriptions/:subId/extend", ctrl.extendSubscription);

// ── المدفوعات ─────────────────────────────────────────────────────────────
// GET  /admin/payments?status=pending&provider=vodafone_cash&page=1
router.get("/payments", ctrl.getAllPayments);

// ── الخطط ────────────────────────────────────────────────────────────────
router.put("/plans/:planId", requireSuperAdmin, ctrl.updatePlan);

// ── BUG 1 FIX: run real AI matching engine ────────────────────────────────
router.post("/run-ai-matching", ctrl.runAIMatching);

// ── BUG 2 FIX: admin soft-delete a review ────────────────────────────────
router.delete("/reviews/:reviewId", ctrl.deleteReview);

// ── إدارة الأدمن (super_admin بس) ────────────────────────────────────────
router.get("/admins", requireSuperAdmin, ctrl.getAllAdmins);
router.post("/admins", requireSuperAdmin, ctrl.createAdmin);
router.put("/admins/:adminId", requireSuperAdmin, ctrl.updateAdmin);
router.delete("/admins/:adminId", requireSuperAdmin, ctrl.deleteAdmin);

module.exports = router;