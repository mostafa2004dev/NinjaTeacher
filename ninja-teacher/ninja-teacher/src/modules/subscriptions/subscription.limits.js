// subscription.limits.js
// Enforcement helpers called by appliedJobs.service and jobPosts.service.
// These are the ONLY new files added for enforcement — all existing modules
// are called, not modified.  Adding a helper import is the smallest safe change.

const Subscription    = require("./subscription.model");
const SubscriptionPlan = require("./subscriptionPlan.model");
const AppliedJob      = require("../appliedJobs/appliedJobs.model");
const Post            = require("../jobPosts/jobPosts.model");
const { Op }          = require("sequelize");

// ── getEffectivePlan ──────────────────────────────────────────────────────
// Returns the plan limits for a user.
// Falls back to the free-tier limits when the user has no active subscription.
async function getEffectivePlan(userId, role) {
  // Try to find an active subscription with plan details
  const sub = await Subscription.findOne({
    where: {
      user_id: userId,
      status: "active",
      expires_at: { [Op.gt]: new Date() },
    },
    include: [{ model: SubscriptionPlan, as: "Plan" }],
    order: [["created_at", "DESC"]],
  });

  if (sub?.Plan) {
    return {
      plan_key:         sub.Plan.plan_key,
      plan_name:        sub.Plan.name,
      max_applications: sub.Plan.max_applications,  // -1 = unlimited
      max_job_posts:    sub.Plan.max_job_posts,      // -1 = unlimited
    };
  }

  // No active subscription → fall back to free-tier limits from the DB
  const freePlanKey = role === "school" ? "school_starter" : "teacher_free";
  const freePlan = await SubscriptionPlan.findOne({
    where: { plan_key: freePlanKey, is_active: true },
  });

  return {
    plan_key:         freePlan?.plan_key  ?? freePlanKey,
    plan_name:        freePlan?.name      ?? "Free",
    max_applications: freePlan?.max_applications ?? (role === "school" ? 0 : 5),
    max_job_posts:    freePlan?.max_job_posts     ?? (role === "school" ? 5 : 0),
  };
}

// ── checkApplicationLimit ─────────────────────────────────────────────────
// Throws if the teacher has reached their monthly application cap.
// -1 means unlimited; 0 means the role cannot apply (school accounts).
async function checkApplicationLimit(teacherId) {
  const plan = await getEffectivePlan(teacherId, "teacher");
  if (plan.max_applications === -1) return; // unlimited

  if (plan.max_applications === 0) {
    throw new Error(
      `Your plan (${plan.plan_name}) does not include job applications. ` +
      `Upgrade to a Teacher plan to apply.`
    );
  }

  // Count applications this calendar month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const count = await AppliedJob.count({
    where: {
      Teacher_ID: teacherId,
      Apply_Date:  { [Op.gte]: monthStart },
    },
  });

  if (count >= plan.max_applications) {
    throw new Error(
      `You have reached your ${plan.plan_name} limit of ` +
      `${plan.max_applications} application(s) per month. ` +
      `Upgrade to Teacher Pro for unlimited applications.`
    );
  }
}

// ── checkJobPostLimit ─────────────────────────────────────────────────────
// Throws if the school has reached their active job-post cap.
// -1 means unlimited.
async function checkJobPostLimit(schoolId) {
  const plan = await getEffectivePlan(schoolId, "school");
  if (plan.max_job_posts === -1) return; // unlimited

  const activeCount = await Post.count({
    where: { School_ID: schoolId, Status: "active" },
  });

  if (activeCount >= plan.max_job_posts) {
    throw new Error(
      `You have reached your ${plan.plan_name} limit of ` +
      `${plan.max_job_posts} active job post(s). ` +
      `Close an existing post or upgrade to ${plan.plan_key === "school_starter" ? "School Pro" : "a higher plan"} for more.`
    );
  }
}

module.exports = { getEffectivePlan, checkApplicationLimit, checkJobPostLimit };
