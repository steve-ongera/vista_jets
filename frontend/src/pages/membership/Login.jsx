// src/pages/membership/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, saveTokens } from '../../services/api'

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await loginUser(form)
      saveTokens(res.tokens)
      localStorage.setItem('vj_user', JSON.stringify(res.user))
      const role = res.user.role
      if (role === 'owner') navigate('/membership/owner-dashboard')
      else if (role === 'admin') navigate('/membership/admin-dashboard')
      else navigate('/membership/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--navy)', fontWeight: 700 }}>
              Vista<span style={{ color: 'var(--gold)' }}>Jets</span>
            </span>
          </Link>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.25rem', color: 'var(--navy)' }}>Member Sign In</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Welcome back. Access your private aviation account.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#991B1B', fontSize: '0.875rem' }}>
              <i className="bi bi-exclamation-triangle-fill" /> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Username or Email</label>
              <input
                className="form-control"
                required
                autoFocus
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-navy btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading
                ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Signing in…</>
                : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/membership/register" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>
                Join Now
              </Link>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
              <Link to="/membership/plans" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>
                View membership plans →
              </Link>
            </p>
          </div>
        </div>

        {/* Back to site */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Back to VistaJets
          </Link>
        </p>
      </div>
    </div>
  )
}
