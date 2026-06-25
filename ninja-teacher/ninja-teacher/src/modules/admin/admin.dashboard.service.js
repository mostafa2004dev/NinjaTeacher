const Teacher      = require("../users/users.model");
const Post         = require("../jobPosts/jobPosts.model");
const AppliedJob   = require("../appliedJobs/appliedJobs.model");
const Subscription = require("../subscriptions/subscription.model");
const Payment      = require("../payments/payment.model");
const Admin        = require("./admin.model");

// ── getOverviewStats ───────────────────────────────────────────────────────
// الأرقام الكبيرة للداشبورد الرئيسي للأدمن
async function getOverviewStats() {
  const [
    total_teachers,
    total_schools,
    total_jobs,
    total_applications,
    active_subscriptions,
    pending_payments,
    total_revenue,
    total_admins,
  ] = await Promise.all([
    Teacher.count({ where: { Role: "teacher" } }),
    Teacher.count({ where: { Role: "school"  } }),
    Post.count(),
    AppliedJob.count(),
    Subscription.count({ where: { status: "active"  } }),
    Payment.count({     where: { status: "pending"  } }),
    Payment.sum("amount", { where: { status: "paid" } }),
    Admin.count({ where: { is_active: true } }),
  ]);

  return {
    users: {
      total_teachers,
      total_schools,
      total: total_teachers + total_schools,
    },
    jobs: {
      total_jobs,
      total_applications,
    },
    subscriptions: {
      active: active_subscriptions,
      pending_payments,
    },
    revenue: {
      total_egp: total_revenue || 0,
    },
    admins: {
      active: total_admins,
    },
  };
}

module.exports = { getOverviewStats };
