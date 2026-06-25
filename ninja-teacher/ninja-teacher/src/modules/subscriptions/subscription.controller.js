const subscriptionService = require("./subscription.service");
const SubscriptionPlan = require("./subscriptionPlan.model");

// GET /subscriptions/plans
// List all active plans. Teachers see teacher plans, schools see school plans.
async function getPlans(req, res) {
  try {
    const userRole = req.userRole || "teacher";
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true, target_role: userRole },
      order: [["price_egp", "ASC"]],
    });
    return res.status(200).json({ status: "success", data: plans });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// GET /subscriptions/plans/all  (public — shows all plans for pricing page)
async function getAllPlans(req, res) {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [["target_role", "ASC"], ["price_egp", "ASC"]],
    });
    return res.status(200).json({ status: "success", data: plans });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// GET /subscriptions/my
// Get current user's active subscription
async function getMySubscription(req, res) {
  try {
    const subscription = await subscriptionService.getActivePlan(req.user.Teacher_ID);
    if (!subscription) {
      return res.status(200).json({
        status: "success",
        data: null,
        message: "No active subscription. You are on the free tier.",
      });
    }
    return res.status(200).json({ status: "success", data: subscription });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// GET /subscriptions/history
async function getSubscriptionHistory(req, res) {
  try {
    const history = await subscriptionService.getSubscriptionHistory(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: history });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /subscriptions
// Body: { plan_key: "teacher_pro", payment_provider: "instapay" }
async function createSubscription(req, res) {
  try {
    const { plan_key, payment_provider } = req.body;
    if (!plan_key) {
      return res.status(400).json({ status: "fail", message: "plan_key is required." });
    }

    const userRole = req.userRole || "teacher";
    const result = await subscriptionService.createSubscription(
      req.user.Teacher_ID,
      plan_key,
      payment_provider,
      userRole
    );

    return res.status(201).json({
      status: "success",
      message: result.activated
        ? "Subscription activated immediately."
        : "Subscription created. Complete payment to activate.",
      data: result,
    });
  } catch (err) {
    const status =
      err.message.includes("already have") ? 409 :
      err.message.includes("not found") ? 404 :
      err.message.includes("only") ? 403 : 400;
    return res.status(status).json({ status: "fail", message: err.message });
  }
}

// POST /subscriptions/upgrade
// Body: { plan_key: "teacher_pro", payment_provider: "vodafone_cash" }
async function upgradeSubscription(req, res) {
  try {
    const { plan_key, payment_provider } = req.body;
    if (!plan_key) {
      return res.status(400).json({ status: "fail", message: "plan_key is required." });
    }
    const userRole = req.userRole || "teacher";
    const result = await subscriptionService.upgradeSubscription(
      req.user.Teacher_ID, plan_key, payment_provider, userRole
    );
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
}

// POST /subscriptions/renew
// Body: { payment_provider: "instapay" }
async function renewSubscription(req, res) {
  try {
    const { payment_provider } = req.body;
    const userRole = req.userRole || "teacher";
    const result = await subscriptionService.renewSubscription(
      req.user.Teacher_ID, payment_provider, userRole
    );
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
}

// DELETE /subscriptions/cancel
async function cancelSubscription(req, res) {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.user.Teacher_ID);
    return res.status(200).json({
      status: "success",
      message: `Subscription cancelled. Remains active until ${subscription.expires_at}.`,
      data: subscription,
    });
  } catch (err) {
    const status = err.message.includes("No active") ? 404 : 500;
    return res.status(status).json({ status: "fail", message: err.message });
  }
}

module.exports = {
  getPlans,
  getAllPlans,
  getMySubscription,
  getSubscriptionHistory,
  createSubscription,
  upgradeSubscription,
  renewSubscription,
  cancelSubscription,
};
