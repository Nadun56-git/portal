import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Lock, User } from 'lucide-react'

// ── Single hardcoded user ──
const VALID_USER = { username: 'admin', password: 'chec@2024' }

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate a short delay for UX
    await new Promise(r => setTimeout(r, 800))

    if (
      form.username.trim() === VALID_USER.username &&
      form.password === VALID_USER.password
    ) {
      localStorage.setItem('chec_auth', 'true')
      navigate('/', { replace: true })
    } else {
      setLoading(false)
      setError('Invalid username or password.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 40%, #0a1628 70%, #06101e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 16px',
          animation: shake ? 'shake 0.5s ease' : 'fadeUp 0.6s ease',
        }}
      >
        {/* Logo + Company Name */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/chec_logo.png"
            alt="CHEC Port City Colombo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              marginBottom: '16px',
              filter: 'drop-shadow(0 0 24px rgba(236,72,153,0.4))',
            }}
          />
          <h1 style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '0.06em',
            margin: '0 0 4px',
          }}>
            CHEC PORT CITY COLOMBO
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '12px',
            letterSpacing: '0.12em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            ERP Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '22px',
            fontWeight: '700',
            margin: '0 0 6px',
          }}>
            Welcome back
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 28px' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569',
                }} />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => { setForm({ ...form, username: e.target.value }); setError('') }}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setError('') }}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 0, display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s, transform 0.1s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9' }}
              onMouseLeave={e => { e.target.style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#334155',
          fontSize: '11px',
          marginTop: '24px',
          letterSpacing: '0.04em',
        }}>
          © 2026 CHEC Port City Colombo (Pvt) Ltd. All rights reserved.
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  )
}
