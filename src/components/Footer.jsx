export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">© 2026 CodeReview AI</p>
          <a
            href="mailto:support@codereviewai.app"
            className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
          >
            support@codereviewai.app
          </a>
        </div>
        <p className="text-gray-600 text-xs text-center leading-snug">
          AI-powered suggestions for informational purposes only. Not a substitute for professional
          security audits. Results may be incomplete.
        </p>
      </div>
    </footer>
  )
}
