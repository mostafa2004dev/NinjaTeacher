const paymentService = require("./payment.service");

// GET /payments/my
async function getMyPayments(req, res) {
  try {
    const payments = await paymentService.getMyPayments(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: payments });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// GET /payments/invoices
async function getMyInvoices(req, res) {
  try {
    const invoices = await paymentService.getMyInvoices(req.user.Teacher_ID);
    return res.status(200).json({ status: "success", data: invoices });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /payments/:paymentId/submit-proof
// Body: { provider_ref: "VFCASH-XXXXXXX", payment_proof: "optional note or image path" }
async function submitPaymentProof(req, res) {
  try {
    const { paymentId } = req.params;
    const { provider_ref, payment_proof } = req.body;

    if (!provider_ref) {
      return res.status(400).json({
        status: "fail",
        message: "provider_ref (your transaction/receipt number) is required.",
      });
    }

    const result = await paymentService.submitPaymentProof(
      paymentId, req.user.Teacher_ID, provider_ref, payment_proof
    );
    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    const status = err.message.includes("not found") ? 404 :
                   err.message.includes("expired") ? 410 : 400;
    return res.status(status).json({ status: "fail", message: err.message });
  }
}

// POST /payments/webhook/:provider
// Called by payment gateway webhooks (no JWT — verified by provider secret)
async function handleWebhook(req, res) {
  try {
    const { provider } = req.params;
    const payload = req.body;

    // Basic webhook secret validation (production: use HMAC signature)
    const secretHeader = req.headers["x-webhook-secret"];
    const expectedSecret = process.env[`${provider.toUpperCase().replace("-", "_")}_WEBHOOK_SECRET`];
    if (expectedSecret && secretHeader !== expectedSecret) {
      return res.status(401).json({ message: "Invalid webhook secret." });
    }

    const { transaction_ref, provider_ref } = payload;
    if (!transaction_ref) {
      return res.status(400).json({ message: "transaction_ref is required in webhook payload." });
    }

    const result = await paymentService.verifyPaymentByWebhook(
      transaction_ref, provider_ref, payload
    );
    return res.status(200).json({ received: true, ...result });
  } catch (err) {
    console.error("[Webhook] Error:", err.message);
    return res.status(500).json({ message: "Webhook processing failed." });
  }
}

// ── Admin controllers ──────────────────────────────────────────────────────

// GET /payments/admin/pending
async function getPendingPayments(req, res) {
  try {
    const Payment = require("./payment.model");
    const payments = await Payment.findAll({
      where: { status: "pending" },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({ status: "success", data: payments });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// PATCH /payments/admin/:paymentId/verify
// Body: { approve: true/false }
async function adminVerifyPayment(req, res) {
  try {
    const { paymentId } = req.params;
    const { approve } = req.body;

    if (typeof approve !== "boolean") {
      return res.status(400).json({
        status: "fail",
        message: 'Body must contain "approve": true or "approve": false',
      });
    }

    const adminIdentifier = req.headers["x-admin-secret"] ? "admin" : "unknown";
    const result = await paymentService.adminVerifyPayment(paymentId, adminIdentifier, approve);

    return res.status(200).json({
      status: "success",
      message: approve ? "Payment approved and subscription activated." : "Payment rejected.",
      data: result,
    });
  } catch (err) {
    const status = err.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ status: "fail", message: err.message });
  }
}

module.exports = {
  getMyPayments,
  getMyInvoices,
  submitPaymentProof,
  handleWebhook,
  getPendingPayments,
  adminVerifyPayment,
};
