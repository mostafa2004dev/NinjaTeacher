// ── InstaPay Provider ─────────────────────────────────────────────────────────
// Adapter for InstaPay gateway.
// When you receive real credentials, implement the real HTTP calls here.
// The rest of the system never changes — it always calls the same interface.

async function initiatePayment({ amount, transactionRef, userPhone, planName }) {
  // TODO: Replace with real API call to InstaPay
  console.log(`[InstaPay] Initiating: ${transactionRef} — EGP ${amount}`);
  return {
    success: true,
    provider_ref: `INSTAPAY-MOCK-${Date.now()}`,
    payment_url: `https://instapay.eg/pay/${transactionRef}`,
    instructions: "Open the InstaPay app and complete payment using the link.",
    raw: { mock: true },
  };
}

async function verifyPayment({ transactionRef, providerRef }) {
  // TODO: Call InstaPay status endpoint
  console.log(`[InstaPay] Verifying: ${providerRef}`);
  return { verified: false, status: "pending", raw: { mock: true } };
}

module.exports = { initiatePayment, verifyPayment };
