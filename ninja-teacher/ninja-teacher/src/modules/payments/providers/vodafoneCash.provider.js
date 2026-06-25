// ── Vodafone Cash Provider ────────────────────────────────────────────────────
// For Vodafone Cash: users send money to a merchant number then submit
// their transaction number as proof. An admin then verifies manually.

async function initiatePayment({ amount, transactionRef, userPhone, planName }) {
  console.log(`[VodafoneCash] Initiating: ${transactionRef} — EGP ${amount}`);
  return {
    success: true,
    provider_ref: null, // generated after user sends money
    payment_url: null,
    instructions: `Send EGP ${amount} to Vodafone Cash number: ${process.env.VODAFONE_CASH_MERCHANT_CODE || "01XXXXXXXXX"}. Then submit your transaction number via POST /payments/:paymentId/submit-proof`,
    raw: { mock: true },
  };
}

async function verifyPayment({ transactionRef, providerRef }) {
  // Vodafone Cash has no public API for auto-verification.
  // Verification is manual — admin calls the admin endpoint.
  console.log(`[VodafoneCash] Manual verification required for: ${providerRef}`);
  return { verified: false, status: "pending_manual_review", raw: { mock: true } };
}

module.exports = { initiatePayment, verifyPayment };
