import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reviewCode } from '../lib/claude'
import { getUsageToday, incrementUsage, FREE_DAILY_LIMIT } from '../lib/supabase'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'C', 'C++', 'Java', 'Go', 'Rust']
const SCAN_TYPES = ['Quick Scan', 'Full Review', 'Security Audit']

export default function Home({ user, subscription }) {
  const [language, setLanguage] = useState('JavaScript')
  const [scanType, setScanType] = useState('Quick Scan')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [usageCount, setUsageCount] = useState(0)
  const [usageLoaded, setUsageLoaded] = useState(false)

  useEffect(() => {
    if (!user) {
      setUsageLoaded(true)
      return
    }
    getUsageToday(user.id)
      .then(setUsageCount)
      .finally(() => setUsageLoaded(true))
  }, [user])

  const atLimit = user && usageCount >= FREE_DAILY_LIMIT && subscription !== 'pro'
  const isProGated = scanType === 'Security Audit' && subscription !== 'pro'
  const canReview = user && !atLimit && !isProGated

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim() || !canReview) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await reviewCode({ code, language, scanType })
      setResults(data)
      await incrementUsage(user.id)
      setUsageCount((c) => c + 1)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
          Catch bugs before they ship
        </h1>
        <p className="text-gray-400 text-xl max-w-lg mx-auto leading-relaxed">
          AI-powered code review with security analysis.{' '}
          <span className="text-gray-300">
            {subscription === 'pro' ? 'Unlimited reviews.' : 'Free for 3 reviews/day.'}
          </span>
        </p>
      </section>

      {/* Review Panel */}
      <section className="px-4 pb-10 max-w-4xl mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8"
        >
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="sm:w-48 shrink-0">
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                Scan Type
              </label>
              <div className="flex gap-2">
                {SCAN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScanType(type)}
                    className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                      scanType === type
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {isProGated && (
                <p className="text-xs text-amber-400 mt-2">
                  Security Audit is a Pro feature.{' '}
                  <Link to="/pricing" className="underline hover:text-amber-300 transition-colors">
                    Upgrade to unlock.
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Code textarea */}
          <div className="mb-5">
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
              Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows={18}
              className="w-full bg-gray-950 border border-gray-700 text-gray-100 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y placeholder-gray-700 leading-relaxed"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Submit area — swaps based on auth/limit state */}
          {!usageLoaded ? (
            <button
              type="button"
              disabled
              className="w-full bg-gray-800 text-gray-600 font-semibold py-3 rounded-xl text-base cursor-not-allowed"
            >
              Loading...
            </button>
          ) : !user ? (
            <UpgradePrompt
              icon="🔒"
              heading="Sign in to analyze code"
              body="Get 3 free reviews per day — no credit card required."
              linkTo="/login"
              linkLabel="Sign in or create a free account →"
            />
          ) : atLimit ? (
            <UpgradePrompt
              icon="⚡"
              heading="You've used all 3 free reviews today"
              body="Upgrade to Pro for unlimited reviews, Security Audit, and review history."
              linkTo="/pricing"
              linkLabel="See Pro plan for $9/month →"
            />
          ) : (
            <>
              <button
                type="submit"
                disabled={loading || !code.trim() || isProGated}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-base shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Code'
                )}
              </button>
              {subscription !== 'pro' && (
                <p className="text-center text-gray-600 text-xs mt-3">
                  {usageCount} of {FREE_DAILY_LIMIT} free reviews used today
                </p>
              )}
            </>
          )}
        </form>
      </section>

      {/* Results Panel */}
      <section className="px-4 pb-20 max-w-4xl mx-auto w-full">
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-400 rounded-xl p-4 mb-6 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {!results && !error && (
          <div className="border border-dashed border-gray-800 rounded-2xl p-14 text-center">
            <p className="text-gray-700 text-sm">Your analysis will appear here</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <ResultSection title="Bugs" items={results.bugs ?? []} accent="red" />
            <ResultSection title="Security Issues" items={results.securityIssues ?? []} accent="orange" />
            <ResultSection title="Improvements" items={results.improvements ?? []} accent="blue" />
          </div>
        )}
      </section>
    </>
  )
}

function UpgradePrompt({ icon, heading, body, linkTo, linkLabel }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 px-6 py-5 text-center">
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-white font-semibold text-sm mb-1">{heading}</p>
      <p className="text-gray-400 text-sm mb-4">{body}</p>
      <Link
        to={linkTo}
        className="inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

function ResultSection({ title, items, accent }) {
  const colors = {
    red: { title: 'text-red-400', badge: 'bg-red-950/70 text-red-400 border border-red-800/60', empty: 'text-gray-600' },
    orange: { title: 'text-orange-400', badge: 'bg-orange-950/70 text-orange-400 border border-orange-800/60', empty: 'text-gray-600' },
    blue: { title: 'text-blue-400', badge: 'bg-blue-950/70 text-blue-400 border border-blue-800/60', empty: 'text-gray-600' },
  }
  const c = colors[accent]

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-5">
        <h2 className={`text-base font-semibold ${c.title}`}>{title}</h2>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className={`text-sm ${c.empty}`}>No {title.toLowerCase()} found.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <FindingCard key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function FindingCard({ item }) {
  return (
    <div className="bg-gray-950 rounded-xl p-4 border border-gray-800/80">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <p className="text-white text-sm font-semibold leading-snug">{item.title}</p>
        <SeverityBadge severity={item.severity} />
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const styles = {
    low: 'bg-gray-800 text-gray-400 border-gray-700',
    medium: 'bg-yellow-950/70 text-yellow-400 border-yellow-800/60',
    high: 'bg-orange-950/70 text-orange-400 border-orange-800/60',
    critical: 'bg-red-950/70 text-red-400 border-red-800/60',
  }
  const s = styles[severity?.toLowerCase()] ?? styles.low
  return (
    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${s}`}>
      {severity}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
