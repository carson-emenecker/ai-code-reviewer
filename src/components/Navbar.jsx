import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ user, subscription }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

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

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/account" className="text-gray-300 hover:text-white text-sm transition-colors">
                Account
              </Link>
              <span className="text-gray-400 text-sm truncate max-w-[180px]">{user.email}</span>
              {subscription === 'pro' && (
                <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
