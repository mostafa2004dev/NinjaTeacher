const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const Subscription = require("./subscription.model");
const SubscriptionPlan = require("./subscriptionPlan.model");
const Payment = require("../payments/payment.model");
const Invoice = require("../payments/invoice.model");
const notifService = require("../notifications/notifications.service");
const { getProvider } = require("../payments/providers/gateway.factory");

// ── Helpers ────────────────────────────────────────────────────────────────

function generateTransactionRef() {
  // Format: TXN-YYYYMMDD-<uuid-short>
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `TXN-${date}-${uuidv4().split("-")[0].toUpperCase()}`;
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await Invoice.count();
  const padded = String(count + 1).padStart(5, "0");
  return `INV-${year}-${padded}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ── getActivePlan ──────────────────────────────────────────────────────────
// Returns the user's current active subscription with plan details.
// Returns null if no active subscription.
async function getActivePlan(userId) {
  return await Subscription.findOne({
    where: {
      user_id: userId,
      status: "active",
      expires_at: { [Op.gt]: new Date() },
    },
    include: [{ model: SubscriptionPlan, as: "Plan" }],
    order: [["created_at", "DESC"]],
  });
}

// ── getSubscriptionHistory ─────────────────────────────────────────────────
async function getSubscriptionHistory(userId) {
  return await Subscription.findAll({
    where: { user_id: userId },
    include: [{ model: SubscriptionPlan, as: "Plan" }],
    order: [["createdAt", "DESC"]],
  });
}

// ── createSubscription ─────────────────────────────────────────────────────
// Creates a subscription record + a pending payment.
// For free plans: activates immediately without payment.
// For paid plans: returns payment instructions; subscription activates after payment.
async function createSubscription(userId, planKey, paymentProvider, userRole) {
  // 1. Validate plan exists and belongs to the correct role
  const plan = await SubscriptionPlan.findOne({
    where: { plan_key: planKey, is_active: true },
  });
  if (!plan) throw new Error(`Plan "${planKey}" not found or inactive.`);

  // 2. Role guard — teachers cannot subscribe to school plans and vice versa
  if (plan.target_role !== userRole) {
    throw new Error(
      `Plan "${planKey}" is for ${plan.target_role}s only. You are registered as a ${userRole}.`
    );
  }

  // 3. Prevent duplicate active subscriptions
  const existing = await getActivePlan(userId);
  if (existing) {
    throw new Error(
      `You already have an active "${existing.Plan.name}" subscription. Cancel or upgrade it first.`
    );
  }

  // 4. For FREE plans — activate immediately, no payment needed
  if (parseFloat(plan.price_egp) === 0) {
    const now = new Date();
    const subscription = await Subscription.create({
      user_id: userId,
      plan_id: plan.id,
      status: "active",
      started_at: now,
      expires_at: addDays(now, plan.duration_days),
      price_paid: 0,
    });

    // Create a zero-amount payment record for audit trail
    const payment = await Payment.create({
      subscription_id: subscription.id,
      user_id: userId,
      amount: 0,
      provider: "free",
      status: "paid",
      transaction_ref: generateTransactionRef(),
      paid_at: now,
    });

    // Generate invoice
    await Invoice.create({
      payment_id: payment.id,
      subscription_id: subscription.id,
      user_id: userId,
      invoice_number: await generateInvoiceNumber(),
      amount: 0,
      plan_name: plan.name,
      billing_period_start: now,
      billing_period_end: subscription.expires_at,
    });

    await notifService.createNotification(
      userId, "subscription_activated",
      "Subscription Activated",
      `Your ${plan.name} plan is now active.`,
      subscription.id
    );

    return { subscription, payment: null, invoice: null, activated: true };
  }

  // 5. For PAID plans — validate provider, create pending records
  if (!paymentProvider) {
    throw new Error("payment_provider is required for paid plans.");
  }

  const provider = getProvider(paymentProvider); // throws if invalid

  // Create subscription in pending state
  const subscription = await Subscription.create({
    user_id: userId,
    plan_id: plan.id,
    status: "pending_payment",
    price_paid: plan.price_egp,
  });

  // Create payment record
  const transactionRef = generateTransactionRef();
  const paymentExpiresAt = addDays(new Date(), 1); // 24 hours to complete payment

  const payment = await Payment.create({
    subscription_id: subscription.id,
    user_id: userId,
    amount: plan.price_egp,
    provider: paymentProvider,
    status: "pending",
    transaction_ref: transactionRef,
    expires_at: paymentExpiresAt,
  });

  // Get payment instructions from the provider adapter
  const providerResponse = await provider.initiatePayment({
    amount: plan.price_egp,
    transactionRef,
    planName: plan.name,
  });

  // Store provider response for audit
  payment.provider_response = providerResponse.raw;
  payment.provider_ref = providerResponse.provider_ref;
  await payment.save();

  return {
    subscription,
    payment: {
      id: payment.id,
      transaction_ref: transactionRef,
      amount: plan.price_egp,
      provider: paymentProvider,
      expires_at: paymentExpiresAt,
      instructions: providerResponse.instructions,
      payment_url: providerResponse.payment_url,
    },
    activated: false,
  };
}

// ── activateSubscription ───────────────────────────────────────────────────
// Called after a payment is confirmed (by webhook or admin).
// Activates the subscription and generates an invoice.
async function activateSubscription(paymentId) {
  const payment = await Payment.findByPk(paymentId, {
    include: [{ model: Subscription, as: "Subscription",
      include: [{ model: SubscriptionPlan, as: "Plan" }],
    }],
  });

  if (!payment) throw new Error("Payment not found.");
  if (payment.status === "paid") throw new Error("Payment already processed.");

  const subscription = payment.Subscription;
  const plan = subscription.Plan;

  const now = new Date();

  // Mark payment as paid
  payment.status = "paid";
  payment.paid_at = now;
  await payment.save();

  // Activate subscription
  subscription.status = "active";
  subscription.started_at = now;
  subscription.expires_at = addDays(now, plan.duration_days);
  await subscription.save();

  // Generate invoice
  const invoice = await Invoice.create({
    payment_id: payment.id,
    subscription_id: subscription.id,
    user_id: subscription.user_id,
    invoice_number: await generateInvoiceNumber(),
    amount: payment.amount,
    plan_name: plan.name,
    billing_period_start: now,
    billing_period_end: subscription.expires_at,
  });

  await notifService.createNotification(
    subscription.user_id, "subscription_activated",
    "Subscription Activated",
    `Your ${plan.name} plan is now active until ${subscription.expires_at.toDateString()}.`,
    subscription.id
  );

  return { subscription, payment, invoice };
}

// ── cancelSubscription ─────────────────────────────────────────────────────
async function cancelSubscription(userId) {
  const subscription = await getActivePlan(userId);
  if (!subscription) throw new Error("No active subscription found.");

  subscription.status = "cancelled";
  subscription.cancelled_at = new Date();
  await subscription.save();

  await notifService.createNotification(
    userId, "subscription_cancelled",
    "Subscription Cancelled",
    `Your ${subscription.Plan.name} subscription has been cancelled. It remains active until ${subscription.expires_at.toDateString()}.`,
    subscription.id
  );

  return subscription;
}

// ── upgradeSubscription ────────────────────────────────────────────────────
// Cancels the current plan and creates a new one.
// A real production system would calculate prorated credit — left as a TODO.
async function upgradeSubscription(userId, newPlanKey, paymentProvider, userRole) {
  const current = await getActivePlan(userId);
  if (current) {
    current.status = "cancelled";
    current.cancelled_at = new Date();
    current.notes = `Upgraded to ${newPlanKey}`;
    await current.save();
  }
  // Create the new subscription (same flow as create)
  return await createSubscription(userId, newPlanKey, paymentProvider, userRole);
}

// ── renewSubscription ──────────────────────────────────────────────────────
// Allows re-subscribing to the same plan after it expires or was cancelled.
async function renewSubscription(userId, paymentProvider, userRole) {
  const lastSub = await Subscription.findOne({
    where: { user_id: userId },
    include: [{ model: SubscriptionPlan, as: "Plan" }],
    order: [["createdAt", "DESC"]],
  });

  if (!lastSub) throw new Error("No previous subscription found to renew.");
  return await createSubscription(userId, lastSub.Plan.plan_key, paymentProvider, userRole);
}

// ── expireStaleSubscriptions ───────────────────────────────────────────────
// Utility: mark overdue subscriptions as "expired".
// Call this from a cron job (or at server startup for simplicity).
async function expireStaleSubscriptions() {
  const [count] = await Subscription.update(
    { status: "expired" },
    {
      where: {
        status: "active",
        expires_at: { [Op.lt]: new Date() },
      },
    }
  );
  if (count > 0) console.log(`[Subscriptions] Expired ${count} stale subscription(s).`);
  return count;
}

// ── expireStalePendingPayments ─────────────────────────────────────────────
// Mark payments older than their expires_at as "expired" and cancel the sub.
async function expireStalePendingPayments() {
  const stale = await Payment.findAll({
    where: {
      status: "pending",
      expires_at: { [Op.lt]: new Date() },
    },
  });

  for (const payment of stale) {
    payment.status = "expired";
    payment.failure_reason = "Payment window expired.";
    await payment.save();

    await Subscription.update(
      { status: "cancelled", notes: "Payment window expired." },
      { where: { id: payment.subscription_id, status: "pending_payment" } }
    );
  }

  if (stale.length > 0) {
    console.log(`[Payments] Expired ${stale.length} stale pending payment(s).`);
  }
}

module.exports = {
  getActivePlan,
  getSubscriptionHistory,
  createSubscription,
  activateSubscription,
  cancelSubscription,
  upgradeSubscription,
  renewSubscription,
  expireStaleSubscriptions,
  expireStalePendingPayments,
};
