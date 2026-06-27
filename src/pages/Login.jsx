import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  function switchMode(next) {
    setMode(next)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  const isSignIn = mode === 'signin'

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignIn ? 'Sign in to your account' : 'Start reviewing code for free'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {!isSignIn && (
              <Field
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              {loading
                ? isSignIn ? 'Signing in…' : 'Creating account…'
                : isSignIn ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 text-gray-200 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {googleLoading ? (
              'Redirecting…'
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* Toggle */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {isSignIn ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
