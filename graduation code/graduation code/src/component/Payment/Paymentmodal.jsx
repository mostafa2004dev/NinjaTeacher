import { X, CreditCard, Building2, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Map plan title → plan_key for the backend
const PLAN_KEY_MAP = {
  'Teacher Free':   'teacher_free',
  'Teacher Pro':    'teacher_pro',
  'School Starter': 'school_starter',
  'School Pro':     'school_pro',
};

// Map payment method UI → backend provider id
const PROVIDER_MAP = {
  card:   'instapay',
  bank:   'instapay',
  mobile: 'vodafone_cash',
};

export function PaymentModal({ isOpen, onClose, onSuccess, plan }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Step 2 state (after backend returns payment id)
  const [step, setStep] = useState('form'); // form | proof
  const [paymentId, setPaymentId] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [providerRef, setProviderRef] = useState('');

  if (!isOpen) return null;

  const isFree = plan.price === 'Free';
  const planKey = PLAN_KEY_MAP[plan.title] || plan.title.toLowerCase().replace(/\s/g, '_');

  const methodBtn = (id, Icon, label) => (
    <button
      onClick={() => setPaymentMethod(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
        paymentMethod === id
          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
      }`}
    >
      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
    </button>
  );

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 transition-all outline-none";
  const labelCls = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  // ── Step 1: initiate subscription ────────────────────────────────
  async function handlePayment() {
    setError('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('userToken');
      const provider = PROVIDER_MAP[paymentMethod] || 'instapay';

      const res = await fetch('http://localhost:3000/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan_key: planKey,
          payment_provider: isFree ? 'free' : provider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // Free plan activates instantly
      if (isFree || data.data?.activated) {
        onSuccess();
        handleClose();
        return;
      }

      // Paid plan → show proof submission step
      const payment = data.data?.payment;
      setPaymentId(payment?.id);
      setInstructions(payment?.instructions || '');
      setPaymentUrl(payment?.payment_url || null);
      setStep('proof');

    } catch {
      setError('Could not connect to the server. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Step 2: submit payment proof ─────────────────────────────────
  async function handleSubmitProof() {
    if (!providerRef.trim()) {
      setError('Transaction / receipt number is required.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`http://localhost:3000/payments/${paymentId}/submit-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ provider_ref: providerRef.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      onSuccess();
      handleClose();
    } catch {
      setError('Could not connect to the server. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleClose() {
    setStep('form');
    setPaymentMethod('card');
    setProviderRef('');
    setError('');
    setInstructions('');
    setPaymentId(null);
    setPaymentUrl(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-5 sm:p-6 relative shadow-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Complete Payment</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subscribe to {plan.title}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-3 mb-5 border border-purple-200 dark:border-purple-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {isFree ? 'Free' : `${plan.price} EGP`}
              </span>
            </div>
          </div>

          {/* ── FORM STEP ── */}
          {step === 'form' && (
            <>
              {!isFree && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {methodBtn('card', CreditCard, 'InstaPay')}
                    {methodBtn('bank', Building2, 'Bank Transfer')}
                    {methodBtn('mobile', Smartphone, 'Vodafone Cash / Orange Cash')}
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && !isFree && (
                <div className="space-y-3 mb-5">
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                    <p className="text-xs text-purple-900 dark:text-purple-300">
                      Click below to proceed. You will receive payment instructions including the InstaPay link.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && !isFree && (
                <div className="space-y-3 mb-5">
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <p className="text-xs text-blue-900 dark:text-blue-300 font-medium mb-1.5">Bank Transfer Details:</p>
                    <div className="space-y-0.5 text-xs text-blue-800 dark:text-blue-400">
                      <p><strong>Reference:</strong> {plan.title.replace(/\s/g, '-').toUpperCase()}</p>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">Full bank details will be shown after clicking Pay.</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'mobile' && !isFree && (
                <div className="space-y-3 mb-5">
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                    <p className="text-xs text-purple-900 dark:text-purple-300">
                      Click below to get the merchant number. Transfer the amount then submit your transaction ID.
                    </p>
                  </div>
                </div>
              )}

              {error && <ErrorBanner message={error} />}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? 'Processing...' : isFree ? 'Activate for Free' : `Pay ${plan.price} EGP`}
              </button>
            </>
          )}

          {/* ── PROOF STEP ── */}
          {step === 'proof' && (
            <>
              {instructions && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-5">
                  <p className="text-xs text-blue-900 dark:text-blue-300 font-medium mb-1">Payment Instructions:</p>
                  <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">{instructions}</p>
                  {paymentUrl && (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 underline underline-offset-2"
                    >
                      Open payment link →
                    </a>
                  )}
                </div>
              )}

              <div className="mb-5">
                <label className={labelCls}>
                  Transaction / Receipt Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={providerRef}
                  onChange={(e) => setProviderRef(e.target.value)}
                  placeholder="e.g. VFCASH-123456789"
                  className={inputCls}
                />
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('form'); setError(''); }}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitProof}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProcessing ? 'Submitting...' : 'Submit Proof'}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Your subscription will be activated within 24 hours after verification.
              </p>
            </>
          )}

          {step === 'form' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              🔒 Your payment information is secure
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}