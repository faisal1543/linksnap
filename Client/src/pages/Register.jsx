import { useState } from 'react'
import axios from 'axios'

function Register({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await axios.post('https://linksnap-production-20d7.up.railway.app/api/auth/register', { email, password })
      setMessage('Account created! You can now sign in.')
      setLoading(false)
    } catch {
      setError('Email already exists')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: 'var(--muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="slide-up" style={{ width: '100%', maxWidth: '400px', padding: '0 1rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>
            <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text)' }}>LinkSnap</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Create your account</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          {error && (
            <div className="fade-in" style={{ background: '#E24B4A15', border: '0.5px solid #E24B4A40', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '1.25rem', fontSize: '13px', color: '#E24B4A' }}>
              {error}
            </div>
          )}
          {message && (
            <div className="fade-in" style={{ background: '#1D9E7515', border: '0.5px solid #1D9E7540', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '1.25rem', fontSize: '13px', color: 'var(--success)' }}>
              {message} <span onClick={onSwitch} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Sign in →</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? 'var(--accent2)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '11px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s, transform 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--accent2)' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--accent)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? <><span className="spinner"></span> Creating account...</> : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--muted)', fontSize: '13px' }}>
          Already have an account?{' '}
          <span onClick={onSwitch} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register