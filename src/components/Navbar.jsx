import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-lg tracking-tight">
          CodeReview AI
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white text-sm transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-gray-300 hover:text-white text-sm transition-colors">
            Pricing
          </Link>
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  )
}
