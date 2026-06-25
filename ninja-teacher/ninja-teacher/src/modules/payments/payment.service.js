// payment.service.js — أُعيدت كتابته بعد تلف RAR
// متوافقة مع payment.controller + تعتمد activateSubscription من subscription.service
const Payment = require("./payment.model");
const Invoice = require("./invoice.model");

// ── مدفوعات المستخدم ─────────────────────────────────────────────
async function getMyPayments(userId) {
  return Payment.findAll({
    where: { user_id: userId },
    order: [["createdAt", "DESC"]],
  });
}

async function getMyInvoices(userId) {
  return Invoice.findAll({
    where: { user_id: userId },
    order: [["createdAt", "DESC"]],
  });
}

// ── المستخدم يرسل إثبات الدفع (رقم العملية/إيصال) ─────────────────
async function submitPaymentProof(paymentId, userId, providerRef, paymentProof) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw new Error("Payment not found.");
  if (payment.user_id !== userId) throw new Error("Payment not found."); // لا تكشف ملكية الغير
  if (payment.status === "paid") throw new Error("Payment already completed.");
  if (payment.status === "expired" || (payment.expires_at && new Date(payment.expires_at) < new Date()))
    throw new Error("Payment window has expired. Please create a new subscription.");

  payment.provider_ref  = providerRef;
  payment.payment_proof = paymentProof || null;
  payment.paid_at       = new Date(); // وقت إرسال الإثبات — التفعيل بعد تأكيد الأدمن
  await payment.save();

  return {
    message: "Payment proof submitted. Your subscription will be activated after verification.",
    data: payment,
  };
}

// ── تأكيد عبر Webhook (مزود الدفع ينادي السيرفر) ───────────────────
async function verifyPaymentByWebhook(transactionRef, providerRef, payload) {
  const payment = await Payment.findOne({ where: { transaction_ref: transactionRef } });
  if (!payment) throw new Error("Payment not found for transaction_ref.");
  if (payment.status === "paid") return { message: "Already processed.", payment };

  payment.provider_ref      = providerRef || payment.provider_ref;
  payment.provider_response = payload || null;
  await payment.save();

  // التفعيل الفعلي (يضع status=paid + ينشئ الفاتورة + يفعّل الاشتراك)
  const { activateSubscription } = require("../subscriptions/subscription.service");
  const result = await activateSubscription(payment.id);
  return { message: "Payment verified and subscription activated.", ...result };
}

// ── تأكيد/رفض يدوي من الأدمن ───────────────────────────────────────
async function adminVerifyPayment(paymentId, adminIdentifier, approve) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw new Error("Payment not found.");
  if (payment.status === "paid") throw new Error("Payment already processed.");

  payment.verified_at = new Date();
  payment.verified_by = adminIdentifier || "admin";

  if (!approve) {
    payment.status = "failed";
    payment.failure_reason = "Rejected by admin verification.";
    await payment.save();
    return { message: "Payment rejected.", payment };
  }

  await payment.save();
  const { activateSubscription } = require("../subscriptions/subscription.service");
  const result = await activateSubscription(payment.id);
  return { message: "Payment approved and subscription activated.", ...result };
}

module.exports = {
  getMyPayments,
  getMyInvoices,
  submitPaymentProof,
  verifyPaymentByWebhook,
  adminVerifyPayment,
};
