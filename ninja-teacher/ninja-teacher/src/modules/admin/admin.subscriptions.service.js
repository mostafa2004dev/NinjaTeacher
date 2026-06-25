const { Op }           = require("sequelize");
const Subscription     = require("../subscriptions/subscription.model");
const SubscriptionPlan = require("../subscriptions/subscriptionPlan.model");
const Payment          = require("../payments/payment.model");
const Invoice          = require("../payments/invoice.model");
const Teacher          = require("../users/users.model");
const notifService     = require("../notifications/notifications.service");

// ── getAllSubscriptions ────────────────────────────────────────────────────
async function getAllSubscriptions({ status, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Subscription.findAndCountAll({
    where,
    include: [
      { model: SubscriptionPlan, as: "Plan",    attributes: ["plan_key", "name", "price_egp"] },
      { model: Teacher,          as: "Teacher", attributes: ["Teacher_ID", "Name", "Email", "Role"] },
    ],
    order:  [["createdAt", "DESC"]],
    limit:  parseInt(limit),
    offset,
  });

  return {
    total:         count,
    page:          parseInt(page),
    total_pages:   Math.ceil(count / parseInt(limit)),
    subscriptions: rows,
  };
}

// ── getSubscriptionById ────────────────────────────────────────────────────
async function getSubscriptionById(subId) {
  const sub = await Subscription.findByPk(subId, {
    include: [
      { model: SubscriptionPlan, as: "Plan" },
      { model: Teacher,          as: "Teacher", attributes: { exclude: ["Password"] } },
      { model: Payment,          as: "Payments" },
      { model: Invoice,          as: "Invoices" },
    ],
  });
  if (!sub) throw new Error("Subscription not found.");
  return sub;
}

// ── forceActivateSubscription ─────────────────────────────────────────────
// الأدمن يفعّل اشتراك يدويًا بدون دفع (مثلًا للتجربة أو للتعويض)
async function forceActivateSubscription(subId, adminName) {
  const sub = await Subscription.findByPk(subId, {
    include: [{ model: SubscriptionPlan, as: "Plan" }],
  });
  if (!sub) throw new Error("Subscription not found.");
  if (sub.status === "active") throw new Error("Subscription is already active.");

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + sub.Plan.duration_days);

  sub.status     = "active";
  sub.started_at = now;
  sub.expires_at = expiresAt;
  sub.notes      = `Force-activated by admin: ${adminName} at ${now.toISOString()}`;
  await sub.save();

  await notifService.createNotification(
    sub.user_id,
    "subscription_activated",
    "Subscription Activated",
    `Your ${sub.Plan.name} subscription has been activated by admin. Valid until ${expiresAt.toDateString()}.`,
    sub.id
  );

  return sub;
}

// ── cancelSubscriptionByAdmin ─────────────────────────────────────────────
async function cancelSubscriptionByAdmin(subId, adminName, reason) {
  const sub = await Subscription.findByPk(subId, {
    include: [{ model: SubscriptionPlan, as: "Plan" }],
  });
  if (!sub) throw new Error("Subscription not found.");

  sub.status       = "cancelled";
  sub.cancelled_at = new Date();
  sub.notes        = `Cancelled by admin: ${adminName}. Reason: ${reason || "N/A"}`;
  await sub.save();

  await notifService.createNotification(
    sub.user_id,
    "subscription_cancelled",
    "Subscription Cancelled",
    `Your ${sub.Plan.name} subscription has been cancelled by admin. Reason: ${reason || "N/A"}`,
    sub.id
  );

  return sub;
}

// ── extendSubscription ────────────────────────────────────────────────────
// الأدمن يمدد الاشتراك عدد أيام معين (مثلًا تعويض عن outage)
async function extendSubscription(subId, extraDays, adminName) {
  if (!extraDays || extraDays < 1) throw new Error("extraDays must be at least 1.");

  const sub = await Subscription.findByPk(subId, {
    include: [{ model: SubscriptionPlan, as: "Plan" }],
  });
  if (!sub) throw new Error("Subscription not found.");
  if (sub.status !== "active") throw new Error("Can only extend active subscriptions.");

  const current_expiry = new Date(sub.expires_at);
  current_expiry.setDate(current_expiry.getDate() + parseInt(extraDays));
  sub.expires_at = current_expiry;
  sub.notes = `Extended by ${extraDays} days by admin: ${adminName}.`;
  await sub.save();

  await notifService.createNotification(
    sub.user_id,
    "subscription_activated",
    "Subscription Extended",
    `Your ${sub.Plan.name} subscription has been extended by ${extraDays} days. New expiry: ${current_expiry.toDateString()}.`,
    sub.id
  );

  return sub;
}

// ── getSubscriptionStats ───────────────────────────────────────────────────
async function getSubscriptionStats() {
  const [active, cancelled, expired, pending, revenue] = await Promise.all([
    Subscription.count({ where: { status: "active"          } }),
    Subscription.count({ where: { status: "cancelled"       } }),
    Subscription.count({ where: { status: "expired"         } }),
    Subscription.count({ where: { status: "pending_payment" } }),
    Payment.sum("amount", { where: { status: "paid" } }),
  ]);

  return { active, cancelled, expired, pending_payment: pending, total_revenue_egp: revenue || 0 };
}

// ── getAllPayments ─────────────────────────────────────────────────────────
async function getAllPayments({ status, provider, page = 1, limit = 20 }) {
  const where = {};
  if (status)   where.status   = status;
  if (provider) where.provider = provider;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      { model: Teacher, as: "Teacher", attributes: ["Teacher_ID", "Name", "Email"] },
    ],
    order:  [["createdAt", "DESC"]],
    limit:  parseInt(limit),
    offset,
  });

  return {
    total:       count,
    page:        parseInt(page),
    total_pages: Math.ceil(count / parseInt(limit)),
    payments:    rows,
  };
}

// ── managePlan ────────────────────────────────────────────────────────────
// الأدمن يعدل بيانات الـ plan (السعر، الاسم، الـ features)
async function updatePlan(planId, updates) {
  const SubscriptionPlanModel = require("../subscriptions/subscriptionPlan.model");
  const plan = await SubscriptionPlanModel.findByPk(planId);
  if (!plan) throw new Error("Plan not found.");

  const allowed = ["name", "price_egp", "duration_days", "billing_cycle",
                   "features", "max_applications", "max_job_posts", "is_active"];
  for (const field of allowed) {
    if (updates[field] !== undefined) plan[field] = updates[field];
  }
  await plan.save();
  return plan;
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  forceActivateSubscription,
  cancelSubscriptionByAdmin,
  extendSubscription,
  getSubscriptionStats,
  getAllPayments,
  updatePlan,
};
