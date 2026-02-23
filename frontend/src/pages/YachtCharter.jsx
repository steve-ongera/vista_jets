import { useState, useEffect } from 'react'
import { createYachtCharter, getYachts } from '../services/api'

export default function YachtCharter() {
  const [yachts, setYachts] = useState([])
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    yacht: '', departure_port: '', destination_port: '',
    charter_start: '', charter_end: '', guest_count: 2,
    itinerary_description: '', special_requests: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getYachts().then(d => setYachts(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = { ...form, yacht: form.yacht || undefined }
      const res = await createYachtCharter(payload)
      setSuccess(res)
    } catch {
      setError('Unable to submit charter request. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem' }}>
      <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚓</div>
        <h2 style={{ marginBottom: '1rem' }}>Charter Requested</h2>
        <div className="divider divider-center" />
        <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{success.message}</p>
        <div style={{ background: 'var(--charcoal)', padding: '1.5rem', borderRadius: 4, marginBottom: '2rem', border: '1px solid var(--ash)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '0.5rem' }}>CHARTER REFERENCE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{success.charter?.reference}</div>
        </div>
        <button className="btn btn-outline" onClick={() => setSuccess(null)}>Submit Another Request</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="section-label">Maritime Charter</span>
          <h1>Yacht <em style={{ color: 'var(--gold)' }}>Charter</em></h1>
          <p style={{ marginTop: '0.5rem' }}>From superyachts to sailing yachts — crewed, catered, and ready to sail.</p>
        </div>
      </div>

      {/* Yacht showcase */}
      {yachts.length > 0 && (
        <section style={{ padding: '4rem 0', background: 'var(--charcoal)' }}>
          <div className="container">
            <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Featured Vessels</h3>
            <div className="grid-3">
              {yachts.map(y => (
                <div key={y.id} className="card">
                  {y.image_url && <img src={y.image_url} alt={y.name} className="card-image" />}
                  <div className="card-body">
                    <span className="card-tag">{y.size_display}</span>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{y.name}</h4>
                    <p style={{ fontSize: '0.8rem' }}>{y.length_meters}m · {y.guest_capacity} guests · {y.crew_count} crew</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.5rem' }}>
                      From ${parseInt(y.daily_rate_usd).toLocaleString()}/day
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <h2 style={{ marginBottom: '2rem' }}>Charter Request</h2>

          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>YOUR DETAILS</h3>
            <div className="form-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} />
              </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>CHARTER DETAILS</h3>
            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Departure Port *</label>
                <input className="form-input" required value={form.departure_port}
                  onChange={e => set('departure_port', e.target.value)}
                  placeholder="e.g. Monaco, Mykonos, Miami" />
              </div>
              <div className="form-group">
                <label className="form-label">Destination Port</label>
                <input className="form-input" value={form.destination_port}
                  onChange={e => set('destination_port', e.target.value)}
                  placeholder="e.g. Santorini (or return to port)" />
              </div>
              <div className="form-group">
                <label className="form-label">Charter Start *</label>
                <input className="form-input" type="date" required value={form.charter_start}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('charter_start', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Charter End *</label>
                <input className="form-input" type="date" required value={form.charter_end}
                  min={form.charter_start || new Date().toISOString().split('T')[0]}
                  onChange={e => set('charter_end', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Guests *</label>
                <input className="form-input" type="number" min={1} required value={form.guest_count}
                  onChange={e => set('guest_count', parseInt(e.target.value))} />
              </div>
              {yachts.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Preferred Vessel</label>
                  <select className="form-select" value={form.yacht} onChange={e => set('yacht', e.target.value)}>
                    <option value="">Let our team recommend</option>
                    {yachts.map(y => <option key={y.id} value={y.id}>{y.name} — {y.size_display}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Itinerary Description</label>
              <textarea className="form-textarea" value={form.itinerary_description}
                onChange={e => set('itinerary_description', e.target.value)}
                placeholder="Describe your ideal route, stops, and activities..." />
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" value={form.special_requests}
                onChange={e => set('special_requests', e.target.value)}
                placeholder="Dietary requirements, celebrations, water sports, chef preferences..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              {loading ? <><span className="loading-spinner" /> Submitting...</> : 'Request Yacht Charter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}