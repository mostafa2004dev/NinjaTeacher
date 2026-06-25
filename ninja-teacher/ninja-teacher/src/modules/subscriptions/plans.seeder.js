const SubscriptionPlan = require("./subscriptionPlan.model");

// ── Plans Seeder ──────────────────────────────────────────────────────────────
// Called once at server startup (inside startServer()).
// Uses upsert so it's safe to run repeatedly — existing plans are updated,
// new ones are inserted, nothing is deleted.
//
// Pricing structure (based on the provided image):
//
//  TEACHER PLANS
//  ─────────────────────────────────────────────────────────────────
//  Free         0 EGP/month   5 applications, basic profile
//  Pro        149 EGP/month   Unlimited apps, priority, analytics
//
//  SCHOOL PLANS
//  ─────────────────────────────────────────────────────────────────
//  Starter    299 EGP/month   5 job posts, basic matching
//  Pro        599 EGP/month   Unlimited posts, advanced matching, analytics

const PLANS = [
  {
    plan_key: "teacher_free",
    name: "Teacher Free",
    target_role: "teacher",
    price_egp: 0.00,
    duration_days: 30,
    billing_cycle: "monthly",
    max_applications: 5,
    max_job_posts: 0,
    features: [
      "Up to 5 job applications per month",
      "Basic teacher profile",
      "Browse all job listings",
      "Email notifications",
    ],
    is_active: true,
  },
  {
    plan_key: "teacher_pro",
    name: "Teacher Pro",
    target_role: "teacher",
    price_egp: 149.00,
    duration_days: 30,
    billing_cycle: "monthly",
    max_applications: -1, // unlimited
    max_job_posts: 0,
    features: [
      "Unlimited job applications",
      "Priority profile visibility",
      "Advanced analytics dashboard",
      "Job match notifications",
      "Application status tracking",
      "Priority customer support",
    ],
    is_active: true,
  },
  {
    plan_key: "school_starter",
    name: "School Starter",
    target_role: "school",
    price_egp: 299.00,
    duration_days: 30,
    billing_cycle: "monthly",
    max_applications: 0,
    max_job_posts: 5,
    features: [
      "Post up to 5 job listings per month",
      "Basic teacher matching",
      "View teacher profiles",
      "Application management",
      "Email notifications",
    ],
    is_active: true,
  },
  {
    plan_key: "school_pro",
    name: "School Pro",
    target_role: "school",
    price_egp: 599.00,
    duration_days: 30,
    billing_cycle: "monthly",
    max_applications: 0,
    max_job_posts: -1, // unlimited
    features: [
      "Unlimited job postings",
      "Advanced teacher matching (by score, experience, specialization)",
      "Detailed analytics & reports",
      "Bulk teacher search",
      "Featured school listing",
      "Priority customer support",
      "API access",
    ],
    is_active: true,
  },
];

async function seedPlans() {
  try {
    for (const plan of PLANS) {
      await SubscriptionPlan.upsert(plan, { conflictFields: ["plan_key"] });
    }
    console.log("✅ Subscription plans seeded successfully.");
  } catch (error) {
    console.error("❌ Failed to seed subscription plans:", error.message);
  }
}

module.exports = { seedPlans };
