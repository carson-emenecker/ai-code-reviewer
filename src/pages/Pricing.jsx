import { useState } from 'react'
import { Link } from 'react-router-dom'
import { redirectToCheckout } from '../lib/stripe'

const FREE_FEATURES = [
  '3 reviews per day',
  'Quick Scan and Full Review',
  'All 8 languages',
  'Community support',
]

const PRO_FEATURES = [
  'Unlimited reviews',
  'All scan types including Security Audit',
  'All 8 languages',
  'Review history',
  'Priority support',
]

export default function Pricing() {
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState(null)

  async function handleProCheckout() {
    setStripeError(null)
    setStripeLoading(true)
    try {
      await redirectToCheckout()
    } catch (err) {
      setStripeError(err.message)
      setStripeLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-400 text-lg">Start free. Upgrade when you need more.</p>
        </div>

        {stripeError && (
          <div className="bg-red-950/60 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm mb-6 text-center">
            {stripeError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          {/* Free card */}
          <PricingCard
            title="Free"
            price="$0"
            period="/ month"
            features={FREE_FEATURES}
            highlighted={false}
            action={
              <Link
                to="/login"
                className="block text-center font-semibold py-3 rounded-xl text-sm transition-all bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                Get Started
              </Link>
            }
          />

          {/* Pro card */}
          <PricingCard
            title="Pro"
            price="$9"
            period="/ month"
            features={PRO_FEATURES}
            highlighted={true}
            badge="Most Popular"
            action={
              <button
                type="button"
                onClick={handleProCheckout}
                disabled={stripeLoading}
                className="w-full font-semibold py-3 rounded-xl text-sm transition-all bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-900/40"
              >
                {stripeLoading ? 'Redirecting to Stripe…' : 'Get Started'}
              </button>
            }
          />
        </div>
      </div>
    </div>
  )
}

function PricingCard({ title, price, period, features, highlighted, badge, action }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 bg-gray-900 ${
        highlighted
          ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-950/50'
          : 'border border-gray-800'
      }`}
    >
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-bold text-white tracking-tight">{price}</span>
          <span className="text-gray-500 mb-1.5 text-base">{period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-gray-300 text-sm leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {action}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}
