import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
