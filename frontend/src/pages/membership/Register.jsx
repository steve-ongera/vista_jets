// src/pages/membership/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, saveTokens } from '../../services/api'

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', company: '', role: 'client', password: '', password2: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await registerUser(form)
      saveTokens(res.tokens)
      localStorage.setItem('vj_user', JSON.stringify(res.user))
      navigate(form.role === 'owner' ? '/membership/owner-dashboard' : '/membership/plans')
    } catch (err) {
      const d = err.data
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--navy)', fontWeight: 700 }}>
              Nairobi<span style={{ color: 'var(--gold)' }}>Jets</span>
            </span>
          </Link>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.25rem', color: 'var(--navy)' }}>Create Your Account</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Join the NairobiJetHouse private aviation network.</p>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#991B1B', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ flexShrink: 0, marginTop: 2 }} /> {error}
            </div>
          )}

          {/* Account type selector */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>I am joining as</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                ['client', 'bi-person-circle',    'Member Client', 'Book private flights with exclusive membership rates'],
                ['owner',  'bi-airplane-engines',  'Fleet Owner',   'List your aircraft and earn revenue per booking'],
              ].map(([role, icon, label, desc]) => (
                <button key={role} type="button" onClick={() => set('role', role)}
                  style={{
                    padding: '1rem', borderRadius: 'var(--radius)',
                    border: `2px solid ${form.role === role ? 'var(--navy)' : 'var(--gray-200)'}`,
                    background: form.role === role ? 'var(--blue-soft)' : 'var(--gray-50)',
                    cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                  }}>
                  <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: form.role === role ? 'var(--navy)' : 'var(--gray-300)', display: 'block', marginBottom: '0.4rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: form.role === role ? 'var(--navy)' : 'var(--gray-700)', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', lineHeight: 1.4 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name <span className="req">*</span></label>
                <input className="form-control" required value={form.first_name}
                  onChange={e => set('first_name', e.target.value)} placeholder="Jane" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name <span className="req">*</span></label>
                <input className="form-control" required value={form.last_name}
                  onChange={e => set('last_name', e.target.value)} placeholder="Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Username <span className="req">*</span></label>
                <input className="form-control" required value={form.username}
                  onChange={e => set('username', e.target.value)} placeholder="janesmith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="req">*</span></label>
                <input className="form-control" type="email" required value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-control" value={form.company}
                  onChange={e => set('company', e.target.value)} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="req">*</span></label>
                <input className="form-control" type="password" required value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="req">*</span></label>
                <input className="form-control" type="password" required value={form.password2}
                  onChange={e => set('password2', e.target.value)} placeholder="Re-enter password" />
              </div>
            </div>

            {/* Password match indicator */}
            {form.password2 && (
              <div style={{ marginBottom: '1.25rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: form.password === form.password2 ? '#1a8754' : '#991B1B' }}>
                <i className={`bi ${form.password === form.password2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
                {form.password === form.password2 ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}

            {/* Terms notice */}
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--navy)' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: 'var(--navy)' }}>Privacy Policy</a>.
            </p>

            <button type="submit" className="btn btn-navy btn-lg" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading
                ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Creating account…</>
                : <><i className="bi bi-person-check" /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link to="/membership/login" style={{ color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Back to NairobiJetHouse
          </Link>
        </p>
      </div>
    </div>
  )
}
