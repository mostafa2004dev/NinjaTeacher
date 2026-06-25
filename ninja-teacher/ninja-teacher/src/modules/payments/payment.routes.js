const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { protect, adminOnly } = require("../../middlewares/auth.middleware");

// ── Webhooks (no auth — called by payment providers) ───────────────────────
router.post("/webhook/:provider", paymentController.handleWebhook);

// ── Protected user routes ──────────────────────────────────────────────────
router.use(protect);

router.get("/my", paymentController.getMyPayments);
router.get("/invoices", paymentController.getMyInvoices);
router.post("/:paymentId/submit-proof", paymentController.submitPaymentProof);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get("/admin/pending", adminOnly, paymentController.getPendingPayments);
router.patch("/admin/:paymentId/verify", adminOnly, paymentController.adminVerifyPayment);

module.exports = router;
