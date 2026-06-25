// ── Orange Cash Provider ──────────────────────────────────────────────────────

async function initiatePayment({ amount, transactionRef, userPhone, planName }) {
  console.log(`[OrangeCash] Initiating: ${transactionRef} — EGP ${amount}`);
  return {
    success: true,
    provider_ref: `ORANGE-MOCK-${Date.now()}`,
    payment_url: null,
    instructions: `Send EGP ${amount} to Orange Cash number: ${process.env.ORANGE_CASH_MERCHANT_ID || "01XXXXXXXXX"}. Submit your receipt via POST /payments/:paymentId/submit-proof`,
    raw: { mock: true },
  };
}

async function verifyPayment({ transactionRef, providerRef }) {
  console.log(`[OrangeCash] Verifying: ${providerRef}`);
  return { verified: false, status: "pending_manual_review", raw: { mock: true } };
}

module.exports = { initiatePayment, verifyPayment };
