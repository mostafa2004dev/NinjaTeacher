import { CheckCircle2, Download, Mail, ArrowRight, Clock } from 'lucide-react';

export function SuccessModal({ isOpen, onClose, plan }) {
  if (!isOpen) return null;

  const isFree = plan.price === 'Free';
  const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 relative shadow-2xl">

          <div className="text-center mb-5">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce ${
              isFree
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              {isFree
                ? <CheckCircle2 className="w-10 h-10 text-white" />
                : <Clock className="w-10 h-10 text-white" />
              }
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isFree ? 'Subscription Activated!' : 'Payment Proof Submitted!'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isFree ? `Welcome to ${plan.title}` : 'Pending verification by our team'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-4 mb-5 border border-purple-200 dark:border-purple-700">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Order Number</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{currentDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{plan.title}</span>
              </div>
              <div className="h-px bg-purple-200 dark:bg-purple-700 my-1"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-900 dark:text-white font-semibold">Amount</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {isFree ? 'Free' : `${plan.price} EGP`}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What's Next?</h3>
            <div className="space-y-2">
              {isFree ? (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      A confirmation email has been sent to your inbox with your subscription details.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowRight className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {plan.userType === 'teacher'
                        ? 'You can now apply to up to 5 jobs per month.'
                        : 'You can now post jobs and connect with qualified teachers.'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Our team will review your payment proof within <strong>24 hours</strong> and activate your subscription.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You'll receive an email notification once your subscription is activated.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              {isFree
                ? plan.userType === 'teacher' ? 'Browse Jobs' : 'Post a Job'
                : 'Got it, thanks!'}
            </button>

            {isFree && (
              <button className="w-full py-3 border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-semibold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Need help? Contact our support team at support@ninjateacher.com
          </p>
        </div>
      </div>
    </div>
  );
}