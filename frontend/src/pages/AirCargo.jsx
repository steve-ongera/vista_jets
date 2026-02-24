// src/pages/AirCargo.jsx
import { useState } from 'react'
import { createAirCargoInquiry } from '../services/api'

const CARGO_TYPES = [
  { value: 'general', label: 'General Cargo', icon: 'bi-box' },
  { value: 'perishables', label: 'Perishables', icon: 'bi-thermometer-snow' },
  { value: 'pharma', label: 'Pharmaceuticals', icon: 'bi-capsule' },
  { value: 'dangerous_goods', label: 'Dangerous Goods', icon: 'bi-exclamation-diamond' },
  { value: 'live_animals', label: 'Live Animals', icon: 'bi-bug' },
  { value: 'artwork', label: 'Artwork / High Value', icon: 'bi-gem' },
  { value: 'automotive', label: 'Automotive', icon: 'bi-car-front' },
  { value: 'oversized', label: 'Oversized / Heavy', icon: 'bi-arrows-fullscreen' },
  { value: 'humanitarian', label: 'Humanitarian Aid', icon: 'bi-heart' },
  { value: 'other', label: 'Other', icon: 'bi-three-dots' },
]

const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard', sub: '3–5 business days', icon: 'bi-clock' },
  { value: 'express', label: 'Express', sub: '24–48 hours', icon: 'bi-lightning' },
  { value: 'critical', label: 'Critical / AOG', sub: 'Same day', icon: 'bi-fire' },
]

function SuccessState({ reference, message, onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: 72, height: 72, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: '#1a8754' }}>
        <i className="bi bi-check-lg" />
      </div>
      <h2 style={{ marginBottom: '0.75rem' }}>Cargo Inquiry Submitted</h2>
      <p style={{ color: 'var(--gray-600)', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
        {message || 'A cargo specialist will respond within 2 hours with routing options and pricing.'}
      </p>
      {reference && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', display: 'inline-block', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Reference Number</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.87rem', color: 'var(--navy)', fontWeight: 600 }}>{reference}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.3rem' }}>Save this to track your shipment</div>
        </div>
      )}
      <br />
      <button className="btn btn-navy" onClick={onNew}><i className="bi bi-arrow-counterclockwise" /> New Inquiry</button>
    </div>
  )
}

export default function AirCargo() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    cargo_type: 'general', cargo_description: '',
    weight_kg: '', volume_m3: '', dimensions: '',
    origin_description: '', destination_description: '',
    pickup_date: '', urgency: 'standard',
    is_hazardous: false, requires_temperature_control: false,
    insurance_required: false, customs_assistance_needed: false,
    additional_notes: '',
  })

  const [form, setForm] = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(blank()); setSuccess(null); setError(null) }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = {
        ...form,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        volume_m3: form.volume_m3 ? parseFloat(form.volume_m3) : null,
      }
      const res = await createAirCargoInquiry(payload)
      setSuccess(res)
    } catch (err) {
      const errData = err?.data
      const msg = typeof errData === 'object' ? Object.values(errData).flat().join(' ') : 'Something went wrong. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  const CAPABILITIES = [
    { icon: 'bi-lightning-charge', title: 'AOG Response', desc: 'Aircraft-on-ground parts anywhere in the world, same-day routing.' },
    { icon: 'bi-thermometer-snow', title: 'Cold Chain', desc: 'Temperature-controlled freight for pharma, biotech, and perishables.' },
    { icon: 'bi-shield-lock', title: 'High-Value Cargo', desc: 'Fine art, jewellery, and bullion with a secure chain of custody.' },
    { icon: 'bi-truck', title: 'Door-to-Door', desc: 'Full customs clearance, bonded warehouse, and last-mile delivery.' },
  ]

  const SectionLabel = ({ icon, children, required }) => (
    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{children}{required && <span className="req"> *</span>}
    </div>
  )

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '8rem 0 6rem', background: 'linear-gradient(135deg, #0b1d3a 0%, #1a2f50 50%, #0b1d3a 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-boxes" /> Air Cargo</span>
          <h1 style={{ color: 'var(--white)', marginTop: '0.5rem', maxWidth: 640 }}>Critical Freight Delivered <em style={{ color: 'var(--gold-light)' }}>On Time</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 540, marginTop: '1.25rem', lineHeight: 1.8 }}>
            From time-critical AOG parts to temperature-sensitive pharmaceuticals and priceless artwork — our dedicated air cargo network moves your freight with unmatched speed and care.
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['bi-lightning', '< 2hr Quote Response'], ['bi-globe2', '187 Countries'], ['bi-shield-check', 'Full Insurance Options']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="grid-4">
            {CAPABILITIES.map(({ icon, title, desc }) => (
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

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div className="text-center mb-4">
            <span className="eyebrow">Get a Quote</span>
            <h2>Tell Us About Your <em>Shipment</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 500, margin: '0 auto' }}>Complete the form below and a cargo specialist will respond within 2 hours with routing options and a full price breakdown.</p>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', marginTop: '2.5rem' }}>
            {success ? (
              <SuccessState reference={success.inquiry?.reference} message={success.message} onNew={reset} />
            ) : (
              <form onSubmit={submit}>
                {error && (
                  <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                    <i className="bi bi-exclamation-triangle" /><span>{error}</span>
                  </div>
                )}

                {/* ── Cargo Type ── */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <SectionLabel icon="bi-box" required>Cargo Type</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {CARGO_TYPES.map(({ value, label, icon }) => (
                      <button key={value} type="button" onClick={() => set('cargo_type', value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.4rem 0.9rem', fontSize: '0.79rem', fontWeight: 500, borderRadius: 20,
                          border: `1.5px solid ${form.cargo_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                          background: form.cargo_type === value ? 'var(--navy)' : 'transparent',
                          color: form.cargo_type === value ? 'white' : 'var(--gray-600)',
                          cursor: 'pointer', transition: 'var(--transition)',
                        }}>
                        <i className={`bi ${icon}`} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Contact ── */}
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
                    <label className="form-label">Company</label>
                    <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your company" />
                  </div>
                </div>

                {/* ── Cargo Description ── */}
                <SectionLabel icon="bi-file-text">Cargo Details</SectionLabel>
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label">Cargo Description <span className="req">*</span></label>
                  <textarea className="form-control" required style={{ minHeight: 80 }}
                    value={form.cargo_description}
                    onChange={e => set('cargo_description', e.target.value)}
                    placeholder="Describe the contents of your shipment, packaging type, and any special handling requirements…" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input className="form-control" type="number" step="0.01" min="0" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="e.g. 250" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Volume (m³)</label>
                    <input className="form-control" type="number" step="0.01" min="0" value={form.volume_m3} onChange={e => set('volume_m3', e.target.value)} placeholder="e.g. 2.5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dimensions (L×W×H cm)</label>
                    <input className="form-control" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 120 × 80 × 100" />
                  </div>
                </div>

                {/* ── Route ── */}
                <SectionLabel icon="bi-map">Route & Timeline</SectionLabel>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Origin <span className="req">*</span></label>
                    <input className="form-control" required value={form.origin_description} onChange={e => set('origin_description', e.target.value)} placeholder="City, country or airport code" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination <span className="req">*</span></label>
                    <input className="form-control" required value={form.destination_description} onChange={e => set('destination_description', e.target.value)} placeholder="City, country or airport code" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Earliest Pickup Date</label>
                    <input className="form-control" type="date" value={form.pickup_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('pickup_date', e.target.value)} />
                  </div>
                </div>

                {/* ── Urgency ── */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <SectionLabel icon="bi-lightning" required>Urgency</SectionLabel>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {URGENCY_OPTIONS.map(({ value, label, sub, icon }) => (
                      <button key={value} type="button" onClick={() => set('urgency', value)}
                        style={{
                          flex: '1 1 150px', padding: '0.85rem 1rem', textAlign: 'left',
                          borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition)',
                          border: `1.5px solid ${form.urgency === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                          background: form.urgency === value ? 'var(--blue-soft)' : 'var(--gray-50)',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                          <i className={`bi ${icon}`} style={{ color: form.urgency === value ? 'var(--navy)' : 'var(--gold)', fontSize: '0.9rem' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: form.urgency === value ? 'var(--navy)' : 'var(--gray-700)' }}>{label}</span>
                          {form.urgency === value && <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)', marginLeft: 'auto' }} />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', paddingLeft: '1.4rem' }}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Special Handling ── */}
                <SectionLabel icon="bi-stars">Special Handling Requirements</SectionLabel>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
                  {[
                    ['is_hazardous', 'bi-exclamation-diamond', 'Hazardous Material'],
                    ['requires_temperature_control', 'bi-thermometer-snow', 'Temperature Control'],
                    ['insurance_required', 'bi-shield-check', 'Insurance Required'],
                    ['customs_assistance_needed', 'bi-file-earmark-check', 'Customs Assistance'],
                  ].map(([k, icon, label]) => (
                    <button key={k} type="button" onClick={() => set(k, !form[k])}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20,
                        border: `1.5px solid ${form[k] ? 'var(--navy)' : 'var(--gray-200)'}`,
                        background: form[k] ? 'var(--blue-soft)' : 'transparent',
                        color: form[k] ? 'var(--navy)' : 'var(--gray-600)',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}>
                      <i className={`bi ${icon}`} style={{ color: form[k] ? 'var(--navy)' : 'var(--gold)' }} />
                      {label}
                      {form[k] && <i className="bi bi-check" />}
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Additional Notes</label>
                  <textarea className="form-control" style={{ minHeight: 80 }}
                    value={form.additional_notes}
                    onChange={e => set('additional_notes', e.target.value)}
                    placeholder="Packaging details, access constraints, documentation notes, consignee details…" />
                </div>

                <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                    : <><i className="bi bi-send" /> Submit Cargo Inquiry</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Cargo Types Info ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">What We Carry</span>
            <h2>Specialist Freight, <em>Every Category</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {[
              { icon: 'bi-capsule', title: 'Pharmaceuticals & Biotech', desc: 'GDP-compliant cold chain, IATA P&C certified aircraft, continuous temperature logging from origin to destination.' },
              { icon: 'bi-gem', title: 'Fine Art & High Value', desc: 'Climate-controlled holds, dedicated security escorts, specialist packing and crating. Museum-grade handling throughout.' },
              { icon: 'bi-lightning-charge', title: 'AOG & Time-Critical', desc: 'Parts on a plane within hours. We operate 24/7 to keep your aircraft flying. Immediate response, guaranteed slot.' },
              { icon: 'bi-bug', title: 'Live Animals', desc: 'IATA LAR-certified transport for equines, exotic species, zoo transfers, and breeding livestock. Vet supervision available.' },
              { icon: 'bi-truck', title: 'Oversized & Heavy Lift', desc: 'Turbine blades, industrial machinery, outsized vehicles. We source the right freighter and manage permits globally.' },
              { icon: 'bi-heart', title: 'Humanitarian & Relief', desc: 'Rapid deployment of aid, medical supplies, and emergency equipment to disaster zones. NGO rates available.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <i className={`bi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--gold)', marginBottom: '1rem', display: 'block' }} />
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h4>
                <p style={{ fontSize: '0.845rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}