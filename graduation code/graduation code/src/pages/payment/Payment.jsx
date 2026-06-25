import { useState } from 'react';
import { PricingCard } from '../../component/Payment/PricingCard';
import { PaymentModal } from '../../component/Payment/Paymentmodal';
import { SuccessModal } from '../../component/Payment/Successmodal';
import { GraduationCap, School, Sparkles } from 'lucide-react';

export default function App() {
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, plan: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, plan: null });

  const handleSubscribe = (plan) => setPaymentModal({ isOpen: true, plan });
  const handlePaymentSuccess = () => setSuccessModal({ isOpen: true, plan: paymentModal.plan });

  const plans = [
    {
      title: 'Teacher Free',
      price: 'Free',
      description: 'Perfect for teachers getting started',
      features: [
        'Create professional profile',
        'Apply to 5 jobs per month',
        'Browse available positions',
        'Email notifications'
      ],
      isPopular: false,
      userType: 'teacher'
    },
    {
      title: 'Teacher Pro',
      price: '29',
      period: 'month',
      description: 'For serious job seekers',
      features: [
        'Everything in Free',
        'Unlimited job applications',
        'Priority listing in searches',
        'Instant job alerts',
        'Application analytics'
      ],
      isPopular: true,
      userType: 'teacher'
    },
    {
      title: 'School Starter',
      price: '79',
      period: 'month',
      description: 'Great for small schools',
      features: [
        'Post up to 3 jobs/month',
        'Access teacher database',
        'Applicant management',
        'Advanced search filters'
      ],
      isPopular: false,
      userType: 'school'
    },
    {
      title: 'School Pro',
      price: '149',
      period: 'month',
      description: 'Most popular for medium schools',
      features: [
        'Everything in Starter',
        'Post up to 10 jobs/month',
        'Featured school profile',
        'Priority support',
        'Detailed analytics'
      ],
      isPopular: true,
      userType: 'school'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" id="pricing">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Simple & Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect teachers with schools. Find your perfect match with our flexible pricing options.
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-10 sm:mb-12">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Teachers</span>
          </div>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Schools</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16 items-start">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              isPopular={plan.isPopular}
              userType={plan.userType}
              onSubscribe={() => handleSubscribe({
                title: plan.title,
                price: plan.price,
                userType: plan.userType
              })}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="inline-block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-100 dark:border-purple-800 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
              All prices include taxes • Cancel anytime • No hidden fees
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              💳 We accept Credit Cards, Bank Transfers & Mobile Payments
            </p>
          </div>
        </div>
      </div>

      {paymentModal.plan && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, plan: null })}
          onSuccess={handlePaymentSuccess}
          plan={paymentModal.plan}
        />
      )}

      {successModal.plan && (
        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, plan: null })}
          plan={successModal.plan}
        />
      )}
    </div>
  );
}