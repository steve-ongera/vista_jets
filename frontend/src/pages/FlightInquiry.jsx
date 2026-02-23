import { useState } from 'react'
import { createFlightInquiry } from '../services/api'

const CATEGORIES = [
  { value: '', label: 'No preference — recommend for me' },
  { value: 'light', label: 'Light Jet (1–6 passengers)' },
  { value: 'midsize', label: 'Midsize Jet (6–8 passengers)' },
  { value: 'super_midsize', label: 'Super Midsize (8–10 passengers)' },
  { value: 'heavy', label: 'Heavy Jet (10–14 passengers)' },
  { value: 'ultra_long', label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliner (large groups)' },
]

export default function FlightInquiry() {
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    origin_description: '', destination_description: '',
    approximate_date: '', passenger_count: 1,
    preferred_aircraft_category: '', message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await createFlightInquiry(form)
      setSuccess(res)
    } catch (err) {
      setError('Unable to submit inquiry. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem' }}>
      <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉</div>
        <h2 style={{ marginBottom: '1rem' }}>Inquiry Sent</h2>
        <div className="divider divider-center" />
        <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{success.message}</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '2rem', color: 'var(--gold)' }}>Reference: {success.inquiry?.reference}</p>
        <button className="btn btn-outline" onClick={() => setSuccess(null)}>Submit Another Inquiry</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Explore Options</span>
          <h1>Flight <em style={{ color: 'var(--gold)' }}>Inquiry</em></h1>
          <p style={{ marginTop: '0.5rem' }}>
            Not ready to book? Tell us where you want to go and we'll build the perfect itinerary.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
            <div>
              <h3 style={{ marginBottom: '1rem' }}>What is a Flight Inquiry?</h3>
              <div className="divider" />
              <p style={{ lineHeight: 1.8 }}>
                A flight inquiry is for exploratory conversations — when you know you want to fly somewhere 
                but aren't sure of exact dates, aircraft, or even the precise destination. 
                Our specialists will work with you to design the perfect journey.
              </p>
            </div>
            <div style={{ background: 'var(--charcoal)', padding: '1.5rem', borderLeft: '2px solid var(--gold)' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Inquiry vs Booking</h4>
              <div style={{ fontSize: '0.8rem', lineHeight: 2 }}>
                <div>📋 <strong>Inquiry</strong> — Explore, ask questions, get options</div>
                <div>✈ <strong>Booking</strong> — Ready to fly, confirm specific dates</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.guest_name}
                  onChange={e => set('guest_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required value={form.guest_email}
                  onChange={e => set('guest_email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">From (general area)</label>
                <input className="form-input" value={form.origin_description}
                  onChange={e => set('origin_description', e.target.value)}
                  placeholder="e.g. New York area, London, Dubai" />
              </div>
              <div className="form-group">
                <label className="form-label">To (general area)</label>
                <input className="form-input" value={form.destination_description}
                  onChange={e => set('destination_description', e.target.value)}
                  placeholder="e.g. South of France, Maldives" />
              </div>
              <div className="form-group">
                <label className="form-label">Approximate Dates</label>
                <input className="form-input" value={form.approximate_date}
                  onChange={e => set('approximate_date', e.target.value)}
                  placeholder="e.g. Late July 2025, or flexible" />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Passengers</label>
                <input className="form-input" type="number" min={1} value={form.passenger_count}
                  onChange={e => set('passenger_count', parseInt(e.target.value))} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Preferred Aircraft Type</label>
              <select className="form-select" value={form.preferred_aircraft_category}
                onChange={e => set('preferred_aircraft_category', e.target.value)}>
                {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Tell us more about your trip *</label>
              <textarea className="form-textarea" required value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="Share any details — purpose of travel, preferred experience, budget range, or questions..."
                style={{ minHeight: 160 }} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              {loading ? <><span className="loading-spinner" /> Sending...</> : 'Send Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}