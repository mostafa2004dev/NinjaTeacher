import { Check } from 'lucide-react';

export function PricingCard({
  title,
  price,
  period = 'month',
  description,
  features,
  isPopular = false,
  userType,
  onSubscribe
}) {
  return (
    <div className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
      isPopular
        ? 'bg-gradient-to-br from-[#9333ea] to-[#6366f1] text-white shadow-2xl scale-100 sm:scale-105 border-2 border-purple-400'
        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="mb-2">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          userType === 'teacher'
            ? isPopular ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
            : isPopular ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
        }`}>
          {userType === 'teacher' ? 'For Teachers' : 'For Schools'}
        </span>
      </div>

      <div className="mb-6">
        <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${!isPopular && 'text-gray-900 dark:text-white'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isPopular ? 'text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>
          {description}
        </p>
      </div>

      <div className="flex items-baseline gap-2 mb-8">
        {price !== 'Free' ? (
          <>
            <span className={`text-3xl sm:text-4xl font-bold ${!isPopular && 'text-purple-600 dark:text-purple-400'}`}>
              ${price}
            </span>
            <span className={`text-base ${isPopular ? 'text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>
              /{period}
            </span>
          </>
        ) : (
          <span className={`text-3xl sm:text-4xl font-bold ${!isPopular && 'text-purple-600 dark:text-purple-400'}`}>
            Free
          </span>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`rounded-full p-0.5 mt-0.5 flex-shrink-0 ${
              isPopular ? 'bg-white/20' : 'bg-purple-100 dark:bg-purple-900/50'
            }`}>
              <Check className={`w-4 h-4 ${isPopular ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
            </div>
            <span className={`text-sm ${isPopular ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isPopular
            ? 'bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl hover:scale-105'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:scale-105'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}