// src/pages/GroupCharter.jsx  — NaN-safe version
import { useState } from 'react'
import { createGroupCharterInquiry } from '../services/api'

const GROUP_TYPES = [
  { value: 'corporate',     label: 'Corporate / Business', icon: 'bi-briefcase' },
  { value: 'sports_team',   label: 'Sports Team',          icon: 'bi-trophy' },
  { value: 'entertainment', label: 'Entertainment / Film', icon: 'bi-camera-video' },
  { value: 'incentive',     label: 'Incentive Group',      icon: 'bi-star' },
  { value: 'wedding',       label: 'Wedding Party',        icon: 'bi-heart' },
  { value: 'government',    label: 'Government / Diplomatic', icon: 'bi-building' },
  { value: 'other',         label: 'Other',                icon: 'bi-three-dots' },
]

const AIRCRAFT_CATEGORIES = [
  { value: '',              label: 'No Preference' },
  { value: 'light',         label: 'Light Jet (up to 8 pax)' },
  { value: 'midsize',       label: 'Midsize Jet (up to 9 pax)' },
  { value: 'super_midsize', label: 'Super Midsize (up to 10 pax)' },
  { value: 'heavy',         label: 'Heavy Jet (up to 16 pax)' },
  { value: 'ultra_long',    label: 'Ultra Long Range (up to 19 pax)' },
  { value: 'vip_airliner',  label: 'VIP Airliner (20+ pax)' },
]

function SuccessState({ reference, message, onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: 72, height: 72, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: '#1a8754' }}>
        <i className="bi bi-check-lg" />
      </div>
      <h2 style={{ marginBottom: '0.75rem' }}>Group Charter Request Received</h2>
      <p style={{ color: 'var(--gray-600)', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
        {message || 'Our group charter specialists will contact you within 4 hours with a tailored solution.'}
      </p>
      {reference && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', display: 'inline-block', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Reference Number</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.87rem', color: 'var(--navy)', fontWeight: 600 }}>{reference}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.3rem' }}>Save this to track your inquiry</div>
        </div>
      )}
      <br />
      <button className="btn btn-navy" onClick={onNew}><i className="bi bi-arrow-counterclockwise" /> New Inquiry</button>
    </div>
  )
}

export default function GroupCharter() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    group_type: 'corporate', group_size: 20,
    origin_description: '', destination_description: '',
    departure_date: '', return_date: '', is_round_trip: false,
    preferred_aircraft_category: '',
    catering_required: false, ground_transport_required: false,
    budget_range: '', additional_notes: '',
  })

  const [form, setForm]   = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const groupSize = parseInt(form.group_size)
      const payload = {
        ...form,
        group_size: isNaN(groupSize) ? 1 : groupSize,
        // Send null for empty dates — Django rejects empty strings for DateField
        departure_date: form.departure_date || null,
        return_date: form.return_date || null,
      }
      const res = await createGroupCharterInquiry(payload)
      setSuccess(res)
    } catch (err) {
      const errData = err?.data
      const msg = typeof errData === 'object' ? Object.values(errData).flat().join(' ') : 'Something went wrong. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  const FEATURES = [
    { icon: 'bi-people-fill',   title: 'Any Group Size',         desc: 'From 10 to 500+ passengers. We configure multiple aircraft or a single VIP airliner to match your exact requirements.' },
    { icon: 'bi-calendar-check',title: 'Coordinated Scheduling', desc: 'Complex multi-leg, multi-aircraft operations handled seamlessly. Your entire group departs and arrives together.' },
    { icon: 'bi-cup-hot',       title: 'Custom Catering',        desc: 'Bespoke menus curated by executive chefs. Dietary requirements, branded packaging, and in-flight entertainment all arranged.' },
    { icon: 'bi-car-front',     title: 'Ground Logistics',       desc: 'End-to-end ground transport, lounge access, and hotel coordination. One point of contact manages everything.' },
  ]

  const SectionLabel = ({ icon, children, required }) => (
    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{children}{required && <span className="req"> *</span>}
    </div>
  )

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '8rem 0 6rem', backgroundImage: 'url(https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(11,29,58,0.92) 0%, rgba(11,29,58,0.6) 100%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-people" /> Group Charter</span>
          <h1 style={{ color: 'var(--white)', marginTop: '0.5rem', maxWidth: 620 }}>Move Your Entire Group, <em style={{ color: 'var(--gold-light)' }}>Effortlessly</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 520, marginTop: '1.25rem', lineHeight: 1.8 }}>
            Sports teams, corporate delegations, wedding parties, film crews — we manage group air travel of every size and type, with military precision and luxury-grade service.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="grid-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.83rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="text-center mb-4">
            <span className="eyebrow">Request a Quote</span>
            <h2>Tell Us About Your <em>Group</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 520, margin: '0 auto' }}>Fill in the details below and our group charter team will respond within 4 hours with aircraft options and pricing.</p>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', marginTop: '2.5rem' }}>
            {success ? (
              <SuccessState reference={success.inquiry?.reference} message={success.message} onNew={reset} />
            ) : (
              <form onSubmit={submit}>
                {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

                {/* Group Type */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <SectionLabel icon="bi-people" required>Group Type</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {GROUP_TYPES.map(({ value, label, icon }) => (
                      <button key={value} type="button" onClick={() => set('group_type', value)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form.group_type === value ? 'var(--navy)' : 'var(--gray-200)'}`, background: form.group_type === value ? 'var(--navy)' : 'transparent', color: form.group_type === value ? 'white' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                        <i className={`bi ${icon}`} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <SectionLabel icon="bi-person">Contact Details</SectionLabel>
                <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input className="form-control" required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input className="form-control" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organisation</label>
                    <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} />
                  </div>
                </div>

                {/* Flight */}
                <SectionLabel icon="bi-map">Flight Details</SectionLabel>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Origin <span className="req">*</span></label>
                    <input className="form-control" required value={form.origin_description} onChange={e => set('origin_description', e.target.value)} placeholder="e.g. New York (JFK/LGA/TEB)" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination <span className="req">*</span></label>
                    <input className="form-control" required value={form.destination_description} onChange={e => set('destination_description', e.target.value)} placeholder="e.g. London (LCY/LHR/FAB)" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Group Size <span className="req">*</span></label>
                    {/* FIX: value uses ?? '' to prevent NaN, onChange guards parseInt */}
                    <input className="form-control" type="number" min={2} required
                      value={form.group_size ?? ''}
                      onChange={e => { const v = parseInt(e.target.value); set('group_size', isNaN(v) ? '' : v) }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure Date</label>
                    <input className="form-control" type="date" value={form.departure_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('departure_date', e.target.value)} />
                  </div>
                </div>

                {/* Round trip */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {[['one_way', 'One Way'], ['round_trip', 'Round Trip']].map(([v, l]) => (
                    <button key={v} type="button"
                      onClick={() => set('is_round_trip', v === 'round_trip')}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${(v === 'round_trip') === form.is_round_trip ? 'var(--navy)' : 'var(--gray-200)'}`, background: (v === 'round_trip') === form.is_round_trip ? 'var(--navy)' : 'transparent', color: (v === 'round_trip') === form.is_round_trip ? 'white' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                      {l}
                    </button>
                  ))}
                </div>

                {form.is_round_trip && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Return Date</label>
                    <input className="form-control" type="date" value={form.return_date} min={form.departure_date || new Date().toISOString().split('T')[0]} onChange={e => set('return_date', e.target.value)} />
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Preferred Aircraft Category</label>
                  <select className="form-control" value={form.preferred_aircraft_category} onChange={e => set('preferred_aircraft_category', e.target.value)}>
                    {AIRCRAFT_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                {/* Add-ons */}
                <SectionLabel icon="bi-stars">Add-ons & Services</SectionLabel>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {[['catering_required', 'bi-cup-hot', 'Catering Package'], ['ground_transport_required', 'bi-car-front', 'Ground Transport']].map(([k, icon, label]) => (
                    <button key={k} type="button" onClick={() => set(k, !form[k])}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form[k] ? 'var(--navy)' : 'var(--gray-200)'}`, background: form[k] ? 'var(--blue-soft)' : 'transparent', color: form[k] ? 'var(--navy)' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                      <i className={`bi ${icon}`} style={{ color: form[k] ? 'var(--navy)' : 'var(--gold)' }} />{label}
                      {form[k] && <i className="bi bi-check" />}
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Estimated Budget</label>
                  <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $100,000 – $250,000" />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Additional Notes</label>
                  <textarea className="form-control" style={{ minHeight: 90 }} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} placeholder="Special requirements, VIP passengers, security considerations, branding…" />
                </div>

                <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-send" /> Submit Group Charter Inquiry</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}