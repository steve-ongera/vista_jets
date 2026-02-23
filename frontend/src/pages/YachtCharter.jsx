import { useState, useEffect } from 'react'
import { createYachtCharter, getYachts } from '../services/api'

const DESTINATIONS = [
  { icon: '🏖', name: 'Mediterranean', desc: 'French Riviera, Amalfi, Greek Islands' },
  { icon: '🏝', name: 'Caribbean',     desc: 'BVI, St Barts, Bahamas, Anguilla' },
  { icon: '🏔', name: 'Indian Ocean',  desc: 'Maldives, Seychelles, Mauritius' },
  { icon: '🌊', name: 'Northern Europe', desc: 'Norwegian Fjords, Iceland, Scotland' },
]

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
  const [error, setError]     = useState(null)

  useEffect(() => { getYachts().then(d => setYachts(d.results || d)).catch(() => {}) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nights = () => {
    if (form.charter_start && form.charter_end) {
      const d = (new Date(form.charter_end) - new Date(form.charter_start)) / 86400000
      return d > 0 ? d : null
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      setSuccess(await createYachtCharter({ ...form, yacht: form.yacht || undefined }))
    } catch { setError('Unable to submit your request. Please try again.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
      <div className="container section">
        <div className="success-card">
          <div className="success-icon" style={{ background: 'var(--blue-soft)' }}>
            <i className="bi bi-water" style={{ color: 'var(--navy)' }} />
          </div>
          <h2>Charter Request Received</h2>
          <div className="gold-rule gold-rule-center" />
          <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{success.message}</p>
          <div className="reference-box">
            <div className="ref-label">Charter Reference</div>
            <div className="ref-value">{success.charter?.reference}</div>
          </div>
          <button className="btn btn-outline-navy mt-3" onClick={() => setSuccess(null)}>
            <i className="bi bi-plus" /> Submit Another Request
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: '68px' }}>
      {/* Hero Header */}
      <div style={{
        position: 'relative', padding: '7rem 0 4rem', overflow: 'hidden',
        backgroundImage: `url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,29,58,0.87) 0%, rgba(11,29,58,0.6) 100%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-water" /> Maritime Charter</span>
          <h1 style={{ color: 'var(--white)', marginBottom: '1rem' }}>
            Superyacht <em style={{ color: 'var(--gold-light)' }}>Charter</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, fontSize: '1rem', lineHeight: 1.8 }}>
            Charter a fully crewed superyacht for a weekend, a week, or the entire Mediterranean season. 
            Our fleet of 800+ vessels spans every ocean — from intimate sailing yachts to 130-metre flagship superyachts.
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {[['bi-people', '12–28 guests'], ['bi-calendar', 'Day to season charters'], ['bi-star', 'Full crew & provisioning']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                <i className={`bi ${icon}`} style={{ color: 'var(--gold-light)' }} />{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations */}
      <section className="section-sm" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="grid-4">
            {DESTINATIONS.map(({ icon, name, desc }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem' }}>{name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Yachts */}
      {yachts.length > 0 && (
        <section className="section-sm">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="eyebrow">Available Now</span>
                <h2 style={{ fontSize: '1.5rem' }}>Featured <em>Vessels</em></h2>
              </div>
            </div>
            <div className="grid-3">
              {yachts.slice(0, 3).map(y => (
                <div className="card" key={y.id}>
                  {y.image_url ? <img src={y.image_url} alt={y.name} className="card-img" /> : <div className="card-img-placeholder"><i className="bi bi-water" /></div>}
                  <div className="card-body">
                    <span className="card-tag">{y.size_display}</span>
                    <div className="card-title">{y.name}</div>
                    <div className="card-meta">
                      {y.length_meters}m &nbsp;·&nbsp; {y.guest_capacity} guests &nbsp;·&nbsp; {y.crew_count} crew
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                      ${parseInt(y.daily_rate_usd).toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--gray-400)' }}>/day</span>
                    </div>
                    {y.home_port && <p style={{ fontSize: '0.78rem' }}><i className="bi bi-geo-alt" style={{ marginRight: 4, color: 'var(--gold)' }} />{y.home_port}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="eyebrow">Request a Charter</span>
            <h2>Plan Your <em>Voyage</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 500, margin: '0 auto' }}>
              Tell us about your dream voyage. Our yacht charter specialists will match you 
              with the perfect vessel, negotiate the best rate, and handle every detail.
            </p>
          </div>

          {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Left col */}
                <div>
                  <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                    <i className="bi bi-person" style={{ color: 'var(--gold)', marginRight: 8 }} />Contact Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Right col */}
                <div>
                  <h4 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                    <i className="bi bi-map" style={{ color: 'var(--gold)', marginRight: 8 }} />Charter Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Departure Port <span className="req">*</span></label>
                      <input className="form-control" required value={form.departure_port} onChange={e => set('departure_port', e.target.value)} placeholder="e.g. Monaco, Mykonos, Miami" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Destination Port</label>
                      <input className="form-control" value={form.destination_port} onChange={e => set('destination_port', e.target.value)} placeholder="or return to departure port" />
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">From <span className="req">*</span></label>
                        <input className="form-control" type="date" required value={form.charter_start} min={new Date().toISOString().split('T')[0]} onChange={e => set('charter_start', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">To <span className="req">*</span></label>
                        <input className="form-control" type="date" required value={form.charter_end} min={form.charter_start || new Date().toISOString().split('T')[0]} onChange={e => set('charter_end', e.target.value)} />
                      </div>
                    </div>
                    {nights() && (
                      <div style={{ background: 'var(--gold-pale)', borderRadius: 'var(--radius)', padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#7A5C22', fontWeight: 500 }}>
                        <i className="bi bi-moon-stars" style={{ marginRight: 6 }} />{nights()} night{nights() > 1 ? 's' : ''} charter
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Number of Guests <span className="req">*</span></label>
                      <input className="form-control" type="number" min={1} required value={form.guest_count} onChange={e => set('guest_count', parseInt(e.target.value))} />
                    </div>
                    {yachts.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Preferred Vessel</label>
                        <select className="form-control" value={form.yacht} onChange={e => set('yacht', e.target.value)}>
                          <option value="">Let our team recommend</option>
                          {yachts.map(y => <option key={y.id} value={y.id}>{y.name} — {y.size_display} ({y.length_meters}m)</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="hr" />

              <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Itinerary Ideas</label>
                  <textarea className="form-control" value={form.itinerary_description} onChange={e => set('itinerary_description', e.target.value)} placeholder="Describe your dream route, island stops, or activities…" style={{ minHeight: 100 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea className="form-control" value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Dietary requirements, celebrations, water sports, diving, chef preferences…" style={{ minHeight: 100 }} />
                </div>
              </div>

              <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-water" /> Submit Charter Request</>}
              </button>
              <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
                No payment at this stage. Our charter specialists will respond within 4 hours.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}