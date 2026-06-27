import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Account({ user, subscription }) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState(null)

  if (!user) return <Navigate to="/login" replace />

  async function handleCancel() {
    setCancelling(true)
    setError(null)
    try {
      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(msg)
      }
      setCancelled(true)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors mb-8 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-2xl font-bold text-white mb-8">Account</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4">Your Plan</h2>

          {subscription === 'pro' ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white font-semibold">Pro Plan</span>
                <span className="bg-green-900/60 text-green-400 border border-green-800/60 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              {cancelled ? (
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your Pro access will continue until the end of your billing period.
                </p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-6">Your subscription renews automatically.</p>

                  {error && (
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                  )}

                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full border border-red-700 text-red-400 hover:bg-red-950/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white font-semibold">Free Plan</span>
              </div>
              <p className="text-gray-400 text-sm mb-5">3 reviews per day.</p>
              <Link
                to="/pricing"
                className="inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Account</h2>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  )
}
