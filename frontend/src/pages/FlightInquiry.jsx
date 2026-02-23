import { useState } from 'react'
import { createFlightInquiry } from '../services/api'

const CATEGORIES = [
  { value: '',              label: 'No preference — advise me' },
  { value: 'light',         label: 'Light Jet  (1–7 passengers, regional)' },
  { value: 'midsize',       label: 'Midsize Jet  (6–9 passengers, up to 5,000 km)' },
  { value: 'super_midsize', label: 'Super Midsize  (8–10 passengers, transatlantic)' },
  { value: 'heavy',         label: 'Heavy Jet  (10–16 passengers, intercontinental)' },
  { value: 'ultra_long',    label: 'Ultra Long Range  (any route, 14,000+ km)' },
  { value: 'vip_airliner',  label: 'VIP Airliner  (20–100+ passengers)' },
]

const FAQ = [
  { q: 'How quickly will I receive a response?', a: 'Our aviation specialists respond to all inquiries within 2–4 hours during business hours, and within 6 hours outside business hours. For urgent trips, call us directly on +1 (800) 547-8538.' },
  { q: 'Is there any cost to submitting an inquiry?', a: 'Absolutely not. Submitting a flight inquiry is completely free and carries no obligation. Our team will present options and pricing for your consideration — you decide whether to proceed.' },
  { q: "What if I don't know my exact dates?", a: "That's exactly what a flight inquiry is for. Give us your approximate timeframe — 'late July', 'sometime in Q3', 'flexible' — and we'll present availability options across your preferred window." },
  { q: 'How does a flight inquiry differ from a booking?', a: 'A flight inquiry is exploratory — ideal when you want to understand pricing, aircraft options, or route feasibility before committing. A booking is for when you know exactly where you want to go and when.' },
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
  const [error, setError]     = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try { setSuccess(await createFlightInquiry(form)) }
    catch { setError('Unable to submit your inquiry. Please try again or contact us directly.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
      <div className="container section">
        <div className="success-card">
          <div className="success-icon"><i className="bi bi-check-lg" /></div>
          <h2>Inquiry Sent Successfully</h2>
          <div className="gold-rule gold-rule-center" />
          <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{success.message}</p>
          <div className="reference-box">
            <div className="ref-label">Inquiry Reference</div>
            <div className="ref-value">{success.inquiry?.reference}</div>
          </div>
          <button className="btn btn-outline-navy mt-3" onClick={() => setSuccess(null)}>
            <i className="bi bi-plus" /> Submit Another Inquiry
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: '68px' }}>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-send" /> Explore Your Options</span>
          <h1>Flight <em style={{ color: 'var(--gold-light)' }}>Inquiry</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 560 }}>
            Not sure which aircraft to choose or whether your route is feasible? 
            Send us a general inquiry and our aviation specialists will guide you through 
            every option — with no obligation and no cost.
          </p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>

            {/* ── Form ── */}
            <div>
              <div className="alert alert-navy" style={{ marginBottom: '2rem' }}>
                <i className="bi bi-info-circle" />
                <span>
                  <strong>Inquiry vs Booking:</strong> An inquiry is for exploration — flexible dates, uncertain routes, or just comparing options. 
                  Ready to commit? <a href="/book-flight" style={{ fontWeight: 600 }}>Book directly here</a>.
                </span>
              </div>

              {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
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
                    <label className="form-label">Number of Passengers</label>
                    <input className="form-control" type="number" min={1} value={form.passenger_count} onChange={e => set('passenger_count', parseInt(e.target.value))} />
                  </div>
                </div>

                <hr className="hr" />

                <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Departure Location</label>
                    <input className="form-control" value={form.origin_description} onChange={e => set('origin_description', e.target.value)} placeholder="e.g. New York area, London, Dubai" />
                    <span className="form-hint">City, region, or airport code — approximate is fine</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination</label>
                    <input className="form-control" value={form.destination_description} onChange={e => set('destination_description', e.target.value)} placeholder="e.g. South of France, Maldives, Tokyo" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approximate Travel Dates</label>
                    <input className="form-control" value={form.approximate_date} onChange={e => set('approximate_date', e.target.value)} placeholder="e.g. Late July 2025, flexible in Q3" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Aircraft Category</label>
                    <select className="form-control" value={form.preferred_aircraft_category} onChange={e => set('preferred_aircraft_category', e.target.value)}>
                      {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="form-label">Your Message <span className="req">*</span></label>
                  <textarea className="form-control" required value={form.message} onChange={e => set('message', e.target.value)}
                    style={{ minHeight: 150 }}
                    placeholder="Share any details about your trip — purpose of travel, preferred experience, budget range, questions about aircraft types or routes, or anything else that would help us assist you…" />
                </div>

                <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                    : <><i className="bi bi-send" /> Send Inquiry</>
                  }
                </button>
                <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.85rem' }}>
                  Free, no-obligation. We'll respond with aircraft options and estimated pricing.
                </p>
              </form>

              {/* FAQ */}
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Frequently Asked Questions</h3>
                {FAQ.map(({ q, a }, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--gray-100)', marginBottom: '0' }}>
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', textAlign: 'left' }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>{q}</span>
                      <i className={`bi bi-chevron-${faqOpen === i ? 'up' : 'down'}`} style={{ color: 'var(--gold)', flexShrink: 0, marginLeft: '1rem' }} />
                    </button>
                    {faqOpen === i && (
                      <p style={{ fontSize: '0.875rem', paddingBottom: '1rem', lineHeight: 1.75 }}>{a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'var(--navy)', border: 'none' }}>
                <h4 style={{ color: 'var(--white)', marginBottom: '1rem' }}>What to Expect</h4>
                <ul className="feature-list">
                  {[
                    ['bi-clock', 'Response within 2–4 hours'],
                    ['bi-airplane', '2–3 tailored aircraft options'],
                    ['bi-cash-coin', 'Transparent pricing breakdown'],
                    ['bi-map', 'Route feasibility analysis'],
                    ['bi-chat-dots', 'No pressure to book'],
                  ].map(([icon, text]) => (
                    <li key={text}><i className={`bi ${icon}`} style={{ color: 'var(--gold-light)' }} /><span style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</span></li>
                  ))}
                </ul>
              </div>

              <div className="info-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>
                  <i className="bi bi-lightbulb" style={{ color: 'var(--gold)', marginRight: 6 }} />Popular Routes
                </div>
                <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                  {['New York → London', 'Dubai → Mykonos', 'Los Angeles → Aspen', 'Geneva → Monaco', 'Singapore → Maldives'].map(r => (
                    <li key={r} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.75rem' }} />{r}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', border: '1px solid var(--gray-100)' }}>
                <i className="bi bi-telephone-fill" style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }} />
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.25rem' }}>Prefer to Talk?</div>
                <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Speak directly with an aviation specialist, 24 / 7.</p>
                <a href="tel:+18005478538" className="btn btn-navy btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  +1 (800) 547-8538
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}