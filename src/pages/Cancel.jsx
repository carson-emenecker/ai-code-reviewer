import { Link } from 'react-router-dom'

export default function Cancel() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-6">👋</p>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          No worries
        </h1>
        <p className="text-gray-400 mb-8">
          You can upgrade anytime. Your 3 free reviews per day are always available.
        </p>
        <Link
          to="/pricing"
          className="inline-block bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Back to pricing
        </Link>
      </div>
    </div>
  )
}
