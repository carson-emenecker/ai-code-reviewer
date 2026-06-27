import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase, getUserSubscription } from './lib/supabase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Success from './pages/Success'
import Cancel from './pages/Cancel'

export default function App() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState('free')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserSubscription(session.user.id).then(setSubscription)
      }
    })

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserSubscription(session.user.id).then(setSubscription)
      } else {
        setSubscription('free')
      }
    })

    return () => authListener.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar user={user} subscription={subscription} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home user={user} subscription={subscription} />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
