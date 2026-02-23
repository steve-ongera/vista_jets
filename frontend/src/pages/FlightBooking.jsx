import { useState, useEffect } from 'react'
import AirportSearch from '../components/AirportSearch'
import { createFlightBooking, getAircraft } from '../services/api'

const INITIAL = {
  guest_name: '', guest_email: '', guest_phone: '', company: '',
  trip_type: 'one_way', passenger_count: 1,
  departure_date: '', departure_time: '', return_date: '',
  aircraft: '', special_requests: '',
  catering_requested: false, ground_transport_requested: false, concierge_requested: false,
}

const ADDONS = [
  { key: 'catering_requested',          icon: 'bi-cup-hot',         label: 'In-Flight Catering',     desc: 'Custom menus prepared by top chefs' },
  { key: 'ground_transport_requested',  icon: 'bi-car-front',       label: 'Ground Transport',        desc: 'Seamless arrival and departure transfers' },
  { key: 'concierge_requested',         icon: 'bi-person-check',    label: 'Personal Concierge',      desc: 'Hotel, dining, and activity bookings' },
]

export default function FlightBooking() {
  const [form, setForm]         = useState(INITIAL)
  const [origin, setOrigin]     = useState(null)
  const [destination, setDest]  = useState(null)
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    getAircraft().then(d => setAircraft(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!origin || !destination) { setError('Please select both origin and destination airports.'); return }
    setLoading(true); setError(null)
    try {
      const res = await createFlightBooking({
        ...form,
        origin: origin.id,
        destination: destination.id,
        aircraft: form.aircraft || undefined,
        return_date: form.trip_type === 'round_trip' ? form.return_date : undefined,
      })
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again or call us directly.')
    } finally { setLoading(false) }
  }

  /* ── Success screen ── */
  if (success) return (
    <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
      <div className="container section">
        <div className="success-card">
          <div className="success-icon"><i className="bi bi-check-lg" /></div>
          <h2 style={{ marginBottom: '0.75rem' }}>Flight Request Submitted</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>{success.message}</p>
          <div className="reference-box">
            <div className="ref-label">Your Booking Reference</div>
            <div className="ref-value">{success.booking?.reference}</div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '2rem' }}>
            <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
            Save this reference to track your booking status. A specialist will contact you within 2–4 hours.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-navy" onClick={() => { setSuccess(null); setForm(INITIAL); setOrigin(null); setDest(null) }}>
              <i className="bi bi-plus" /> New Booking
            </button>
            <a href={`/track`} className="btn btn-outline-navy">
              <i className="bi bi-search" /> Track This Booking
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: '68px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-airplane" /> Private Jet Charter</span>
          <h1>Book a Private <em style={{ color: 'var(--gold-light)' }}>Flight</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 560 }}>
            Charter a private jet to any destination worldwide. Submit your request in minutes — 
            no account required. Our specialists will confirm availability and pricing within hours.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

            {/* ── Main Form ── */}
            <div>
              {error && (
                <div className="alert alert-error">
                  <i className="bi bi-exclamation-triangle" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Section: Contact */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Your Details</h3>
                  <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>We'll use these to send you the quote and confirmation.</p>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} placeholder="john@company.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} placeholder="+1 555 000 0000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company / Organisation</label>
                      <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional" />
                    </div>
                  </div>
                </div>

                <hr className="hr" />

                {/* Section: Flight Details */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Flight Details</h3>
                  <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Tell us where you'd like to go and when.</p>

                  {/* Trip type tabs */}
                  <div className="tab-nav" style={{ marginBottom: '1.75rem' }}>
                    {[['one_way','<i class="bi bi-arrow-right"></i> One Way'],['round_trip','<i class="bi bi-arrow-left-right"></i> Round Trip'],['multi_leg','<i class="bi bi-diagram-3"></i> Multi-Leg']].map(([val, label]) => (
                      <button key={val} type="button"
                        className={`tab-btn${form.trip_type === val ? ' active' : ''}`}
                        onClick={() => set('trip_type', val)}
                        dangerouslySetInnerHTML={{ __html: label }}
                      />
                    ))}
                  </div>

                  <div className="form-grid">
                    <AirportSearch label="From" value={origin} onChange={setOrigin} placeholder="City or airport" required />
                    <AirportSearch label="To" value={destination} onChange={setDest} placeholder="City or airport" required />
                    <div className="form-group">
                      <label className="form-label">Departure Date <span className="req">*</span></label>
                      <input className="form-control" type="date" required value={form.departure_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => set('departure_date', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Departure Time</label>
                      <input className="form-control" type="time" value={form.departure_time} onChange={e => set('departure_time', e.target.value)} />
                    </div>
                    {form.trip_type === 'round_trip' && (
                      <div className="form-group">
                        <label className="form-label">Return Date <span className="req">*</span></label>
                        <input className="form-control" type="date" required value={form.return_date}
                          min={form.departure_date || new Date().toISOString().split('T')[0]}
                          onChange={e => set('return_date', e.target.value)} />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Number of Passengers <span className="req">*</span></label>
                      <input className="form-control" type="number" min={1} max={400} required value={form.passenger_count} onChange={e => set('passenger_count', parseInt(e.target.value))} />
                    </div>
                  </div>

                  {aircraft.length > 0 && (
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label">Preferred Aircraft <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(optional — our team will recommend)</span></label>
                      <select className="form-control" value={form.aircraft} onChange={e => set('aircraft', e.target.value)}>
                        <option value="">Recommend the best option for my trip</option>
                        {aircraft.map(ac => (
                          <option key={ac.id} value={ac.id}>
                            {ac.name} — {ac.category_display} · up to {ac.passenger_capacity} passengers
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <hr className="hr" />

                {/* Section: Add-ons */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Additional Services</h3>
                  <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Enhance your journey with our premium services.</p>
                  <div className="grid-3">
                    {ADDONS.map(({ key, icon, label, desc }) => (
                      <label
                        key={key}
                        className={`check-group${form[key] ? ' checked' : ''}`}
                        onClick={() => set(key, !form[key])}
                        style={{ cursor: 'pointer' }}
                      >
                        <input type="checkbox" checked={form[key]} onChange={() => {}} style={{ display: 'none' }} />
                        <i className={`bi ${icon}`} style={{ color: form[key] ? 'var(--navy)' : 'var(--gold)', fontSize: '1.1rem' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{label}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--gray-400)', marginTop: 2 }}>{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section: Special Requests */}
                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="form-label">Special Requests & Notes</label>
                  <textarea className="form-control" value={form.special_requests}
                    onChange={e => set('special_requests', e.target.value)}
                    placeholder="Dietary requirements, preferred aircraft configuration, special occasions, arrival preferences…" />
                  <span className="form-hint">Any detail you share helps us tailor your experience perfectly.</span>
                </div>

                <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Processing Your Request…</>
                    : <><i className="bi bi-send" /> Submit Flight Request</>
                  }
                </button>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.85rem' }}>
                  <i className="bi bi-shield-check" style={{ marginRight: 5 }} />
                  No payment required at this stage. Our team will contact you with a personalised quote.
                </p>
              </form>
            </div>

            {/* ── Sidebar ── */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <div className="info-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <i className="bi bi-clock" style={{ marginRight: 6, color: 'var(--gold)' }} />
                  Response Time
                </div>
                <p style={{ fontSize: '0.82rem' }}>Our aviation specialists typically respond within <strong>2–4 hours</strong>, even on weekends and public holidays.</p>
              </div>

              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>What Happens Next?</h4>
                <ul className="feature-list">
                  <li><i className="bi bi-1-circle" /> We review your request and check fleet availability</li>
                  <li><i className="bi bi-2-circle" /> We send you a tailored quote by email</li>
                  <li><i className="bi bi-3-circle" /> You confirm and we arrange everything else</li>
                  <li><i className="bi bi-4-circle" /> Enjoy a seamless, door-to-door experience</li>
                </ul>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: 'var(--navy)', border: 'none' }}>
                <h4 style={{ color: 'var(--white)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Prefer to Talk?</h4>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', marginBottom: '1rem' }}>Our concierge team is available 24 / 7 by phone.</p>
                <a href="tel:+18005478538" className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="bi bi-telephone" /> +1 (800) 547-8538
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}