export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <p className="text-gray-500 text-sm shrink-0">
          © 2026 CodeReview AI{' · '}
          <a href="mailto:support@codereviewai.app" className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
            support@codereviewai.app
          </a>
        </p>
        <p className="text-gray-600 text-xs text-right leading-snug">
          AI-powered suggestions for informational purposes only. Not a substitute for professional
          security audits. Results may be incomplete.
        </p>
      </div>
    </footer>
  )
}
