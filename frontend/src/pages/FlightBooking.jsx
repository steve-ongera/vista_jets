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

export default function FlightBooking() {
  const [form, setForm] = useState(INITIAL)
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAircraft().then(d => setAircraft(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!origin || !destination) { setError('Please select origin and destination airports.'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        ...form,
        origin: origin.id,
        destination: destination.id,
        aircraft: form.aircraft || undefined,
        return_date: form.trip_type === 'round_trip' ? form.return_date : undefined,
      }
      const res = await createFlightBooking(payload)
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const ref = success.booking?.reference
    return (
      <div style={{ minHeight: '100vh', paddingTop: '8rem' }}>
        <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈</div>
          <h2 style={{ marginBottom: '1rem' }}>Request Received</h2>
          <div className="divider divider-center" />
          <p style={{ marginBottom: '2rem', lineHeight: 1.8 }}>{success.message}</p>
          <div style={{ background: 'var(--charcoal)', padding: '1.5rem', borderRadius: 4, marginBottom: '2rem', border: '1px solid var(--ash)' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '0.5rem' }}>BOOKING REFERENCE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{ref}</div>
          </div>
          <p style={{ fontSize: '0.8rem', marginBottom: '2rem' }}>
            Save this reference to track your booking status at <strong>/track</strong>
          </p>
          <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm(INITIAL); setOrigin(null); setDestination(null) }}>
            Book Another Flight
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Private Aviation</span>
          <h1>Book a <em style={{ color: 'var(--gold)' }}>Flight</em></h1>
          <p style={{ marginTop: '0.5rem' }}>No account needed. Fill in your details and we'll take it from here.</p>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <h3 style={{ marginBottom: '1.5rem' }}>Your Information</h3>
            <div className="form-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.guest_name}
                  onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required value={form.guest_email}
                  onChange={e => set('guest_email', e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.guest_phone}
                  onChange={e => set('guest_phone', e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company}
                  onChange={e => set('company', e.target.value)} placeholder="Optional" />
              </div>
            </div>

            {/* Trip Type */}
            <h3 style={{ marginBottom: '1.5rem' }}>Flight Details</h3>
            <div className="tab-nav" style={{ marginBottom: '2rem' }}>
              {[['one_way', 'One Way'], ['round_trip', 'Round Trip'], ['multi_leg', 'Multi-Leg']].map(([val, label]) => (
                <button key={val} type="button" className={`tab-btn ${form.trip_type === val ? 'active' : ''}`}
                  onClick={() => set('trip_type', val)}>{label}</button>
              ))}
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <AirportSearch label="From *" value={origin} onChange={setOrigin} placeholder="Departure city or airport" />
              <AirportSearch label="To *" value={destination} onChange={setDestination} placeholder="Arrival city or airport" />
              <div className="form-group">
                <label className="form-label">Departure Date *</label>
                <input className="form-input" type="date" required value={form.departure_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('departure_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Departure Time</label>
                <input className="form-input" type="time" value={form.departure_time}
                  onChange={e => set('departure_time', e.target.value)} />
              </div>
              {form.trip_type === 'round_trip' && (
                <div className="form-group">
                  <label className="form-label">Return Date *</label>
                  <input className="form-input" type="date" required value={form.return_date}
                    min={form.departure_date || new Date().toISOString().split('T')[0]}
                    onChange={e => set('return_date', e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Passengers *</label>
                <input className="form-input" type="number" min={1} max={400} required value={form.passenger_count}
                  onChange={e => set('passenger_count', parseInt(e.target.value))} />
              </div>
            </div>

            {/* Aircraft selection */}
            {aircraft.length > 0 && (
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">Preferred Aircraft (optional)</label>
                <select className="form-select" value={form.aircraft} onChange={e => set('aircraft', e.target.value)}>
                  <option value="">Let our team recommend</option>
                  {aircraft.map(ac => (
                    <option key={ac.id} value={ac.id}>
                      {ac.name} — {ac.category_display} · {ac.passenger_capacity} pax
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Extras */}
            <h3 style={{ marginBottom: '1.5rem' }}>Additional Services</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {[
                ['catering_requested', '🍽 Catering'],
                ['ground_transport_requested', '🚗 Ground Transport'],
                ['concierge_requested', '🤝 Concierge Service'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                    style={{ accentColor: 'var(--gold)' }} />
                  {label}
                </label>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Special Requests</label>
              <textarea className="form-textarea" value={form.special_requests}
                onChange={e => set('special_requests', e.target.value)}
                placeholder="Any dietary requirements, preferred aircraft configuration, or special occasions..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              {loading ? <><span className="loading-spinner" /> Processing...</> : 'Submit Flight Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}