import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [transitioning, setTransitioning] = useState(false)

  const switchPage = (newPage) => {
    setTransitioning(true)
    setTimeout(() => {
      setPage(newPage)
      setTransitioning(false)
    }, 200)
  }

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    setTransitioning(true)
    setTimeout(() => {
      localStorage.removeItem('token')
      setToken(null)
      setPage('login')
      setTransitioning(false)
    }, 200)
  }

  if (token) {
    return (
      <div className={transitioning ? '' : 'fade-in'}>
        <Dashboard token={token} onLogout={handleLogout} />
      </div>
    )
  }

  return (
    <div className={transitioning ? '' : 'fade-in'}>
      {page === 'login' ? (
        <Login onLogin={handleLogin} onSwitch={() => switchPage('register')} />
      ) : (
        <Register onSwitch={() => switchPage('login')} />
      )}
    </div>
  )
}

export default App