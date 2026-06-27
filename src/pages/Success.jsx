import { Link } from 'react-router-dom'

export default function Success() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-6">🎉</p>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          You&apos;re now a Pro member!
        </h1>
        <p className="text-gray-400 mb-8">
          Enjoy unlimited reviews, Security Audit, and everything else Pro has to offer.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Start reviewing code
        </Link>
      </div>
    </div>
  )
}
