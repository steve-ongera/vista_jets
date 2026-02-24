// src/pages/AircraftSales.jsx
import { useState } from 'react'
import { createAircraftSalesInquiry } from '../services/api'

const INQUIRY_TYPES = [
  { value: 'buy', label: 'Looking to Buy', icon: 'bi-bag-check', desc: 'Browse our curated inventory or let us source your ideal aircraft.' },
  { value: 'sell', label: 'Looking to Sell', icon: 'bi-tag', desc: 'List your aircraft with our global network of qualified buyers.' },
  { value: 'trade', label: 'Trade / Part Exchange', icon: 'bi-arrow-left-right', desc: 'Upgrade your current aircraft with a seamless trade-in arrangement.' },
  { value: 'valuation', label: 'Valuation Only', icon: 'bi-calculator', desc: 'Receive a confidential market valuation from our appraisal team.' },
]

const AIRCRAFT_CATEGORIES = [
  { value: 'light', label: 'Light Jet' },
  { value: 'midsize', label: 'Midsize Jet' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy', label: 'Heavy Jet' },
  { value: 'ultra_long', label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliner' },
]

const BUDGET_OPTIONS = [
  { value: 'under_2m', label: 'Under $2M' },
  { value: '2m_5m', label: '$2M – $5M' },
  { value: '5m_15m', label: '$5M – $15M' },
  { value: '15m_30m', label: '$15M – $30M' },
  { value: '30m_60m', label: '$30M – $60M' },
  { value: 'over_60m', label: 'Over $60M' },
  { value: 'not_disclosed', label: 'Prefer not to say' },
]

function SuccessState({ reference, message, onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ width: 72, height: 72, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem', color: '#1a8754' }}>
        <i className="bi bi-check-lg" />
      </div>
      <h2 style={{ marginBottom: '0.75rem' }}>Sales Inquiry Received</h2>
      <p style={{ color: 'var(--gray-600)', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
        {message || 'Our aviation sales team will contact you within 24 hours to discuss your requirements.'}
      </p>
      {reference && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem 1.5rem', display: 'inline-block', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Reference Number</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.87rem', color: 'var(--navy)', fontWeight: 600 }}>{reference}</div>
        </div>
      )}
      <br />
      <button className="btn btn-navy" onClick={onNew}><i className="bi bi-arrow-counterclockwise" /> New Inquiry</button>
    </div>
  )
}

export default function AircraftSales() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    inquiry_type: 'buy',
    // buyer fields
    preferred_category: '', preferred_make_model: '',
    budget_range: 'not_disclosed', new_or_pre_owned: 'either',
    // seller fields
    aircraft_make: '', aircraft_model: '',
    year_of_manufacture: '', serial_number: '',
    total_flight_hours: '', asking_price_usd: '',
    message: '',
  })

  const [form, setForm] = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(blank()); setSuccess(null); setError(null) }

  const isBuyer  = form.inquiry_type === 'buy'  || form.inquiry_type === 'trade'
  const isSeller = form.inquiry_type === 'sell' || form.inquiry_type === 'trade'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = {
        ...form,
        year_of_manufacture: form.year_of_manufacture ? parseInt(form.year_of_manufacture) : null,
        total_flight_hours: form.total_flight_hours ? parseInt(form.total_flight_hours) : null,
        asking_price_usd: form.asking_price_usd ? parseFloat(form.asking_price_usd) : null,
      }
      const res = await createAircraftSalesInquiry(payload)
      setSuccess(res)
    } catch (err) {
      const errData = err?.data
      const msg = typeof errData === 'object' ? Object.values(errData).flat().join(' ') : 'Something went wrong. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  const SectionLabel = ({ icon, children }) => (
    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{children}
    </div>
  )

  const WHY = [
    { icon: 'bi-globe2', title: 'Global Buyer Network', desc: 'Access to 3,000+ qualified private aviation buyers and corporate flight departments worldwide.' },
    { icon: 'bi-graph-up', title: 'Market Intelligence', desc: 'Real-time aircraft valuations backed by 20 years of transaction data and current market conditions.' },
    { icon: 'bi-file-earmark-check', title: 'Transaction Management', desc: 'Pre-purchase inspections, escrow, title search, airworthiness review — we manage the entire process.' },
    { icon: 'bi-lock', title: 'Confidential Process', desc: 'Discreet off-market listings available. Your transaction details are never shared without consent.' },
  ]

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '8rem 0 6rem', backgroundImage: 'url(https://images.unsplash.com/photo-1583396618422-c9e25cf95027?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 60%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(11,29,58,0.93) 0%, rgba(11,29,58,0.65) 100%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-airplane-engines" /> Aircraft Sales</span>
          <h1 style={{ color: 'var(--white)', marginTop: '0.5rem', maxWidth: 660 }}>Buy, Sell or Trade Your <em style={{ color: 'var(--gold-light)' }}>Private Aircraft</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 540, marginTop: '1.25rem', lineHeight: 1.8 }}>
            Whether you're acquiring your first jet or upgrading an existing fleet, our specialist sales team brings unrivalled market access, discretion, and expertise to every transaction.
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['bi-collection', '500+ Aircraft Listed'], ['bi-cash-stack', '$2B+ Transactions Managed'], ['bi-person-check', 'Dedicated Sales Advisor']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why VistaJets Sales ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="grid-4">
            {WHY.map(({ icon, title, desc }) => (
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
            <span className="eyebrow">Start the Conversation</span>
            <h2>Aircraft Sales <em>Inquiry</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 520, margin: '0 auto' }}>Tell us what you're looking for — or what you have to offer. Our team will respond within 24 hours with market insights and next steps.</p>
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

                {/* ── Inquiry Type ── */}
                <div style={{ marginBottom: '2rem' }}>
                  <SectionLabel icon="bi-question-circle">What are you looking to do?</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {INQUIRY_TYPES.map(({ value, label, icon, desc }) => (
                      <button key={value} type="button" onClick={() => set('inquiry_type', value)}
                        style={{
                          padding: '1rem 1.25rem', textAlign: 'left', borderRadius: 'var(--radius)',
                          border: `1.5px solid ${form.inquiry_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                          background: form.inquiry_type === value ? 'var(--blue-soft)' : 'var(--gray-50)',
                          cursor: 'pointer', transition: 'var(--transition)',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className={`bi ${icon}`} style={{ color: form.inquiry_type === value ? 'var(--navy)' : 'var(--gold)', fontSize: '1rem' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: form.inquiry_type === value ? 'var(--navy)' : 'var(--gray-700)' }}>{label}</span>
                          </div>
                          {form.inquiry_type === value && <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)' }} />}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: 0, paddingLeft: '1.6rem', lineHeight: 1.4 }}>{desc}</p>
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
                    <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional" />
                  </div>
                </div>

                {/* ── Buyer Fields ── */}
                {isBuyer && (
                  <>
                    <div style={{ background: 'var(--blue-soft)', border: '1px solid #BED1EF', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <i className="bi bi-bag-check" style={{ color: 'var(--navy)' }} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 500 }}>Tell us about your ideal aircraft and we'll match you with available inventory or source it from our global network.</span>
                    </div>
                    <SectionLabel icon="bi-airplane">Aircraft Requirements</SectionLabel>
                    <div className="form-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Preferred Category</label>
                        <select className="form-control" value={form.preferred_category} onChange={e => set('preferred_category', e.target.value)}>
                          <option value="">No Preference</option>
                          {AIRCRAFT_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Preferred Make / Model</label>
                        <input className="form-control" value={form.preferred_make_model} onChange={e => set('preferred_make_model', e.target.value)} placeholder="e.g. Gulfstream G650, Challenger 350" />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>Budget Range</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {BUDGET_OPTIONS.map(({ value, label }) => (
                          <button key={value} type="button" onClick={() => set('budget_range', value)}
                            style={{
                              padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 20,
                              border: `1.5px solid ${form.budget_range === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                              background: form.budget_range === value ? 'var(--navy)' : 'transparent',
                              color: form.budget_range === value ? 'white' : 'var(--gray-600)',
                              cursor: 'pointer', transition: 'var(--transition)',
                            }}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.6rem' }}>New or Pre-Owned?</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[['new', 'New'], ['pre_owned', 'Pre-Owned'], ['either', 'Either']].map(([v, l]) => (
                          <button key={v} type="button" onClick={() => set('new_or_pre_owned', v)}
                            style={{
                              padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 500, borderRadius: 20,
                              border: `1.5px solid ${form.new_or_pre_owned === v ? 'var(--navy)' : 'var(--gray-200)'}`,
                              background: form.new_or_pre_owned === v ? 'var(--navy)' : 'transparent',
                              color: form.new_or_pre_owned === v ? 'white' : 'var(--gray-600)',
                              cursor: 'pointer', transition: 'var(--transition)',
                            }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Seller Fields ── */}
                {isSeller && (
                  <>
                    {form.inquiry_type === 'trade' && <div style={{ width: '100%', height: 1, background: 'var(--gray-100)', margin: '0.5rem 0 1.5rem' }} />}
                    <div style={{ background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <i className="bi bi-tag" style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: '0.82rem', color: '#7A5C22', fontWeight: 500 }}>Provide details about the aircraft you wish to sell or trade. All information is treated with strict confidentiality.</span>
                    </div>
                    <SectionLabel icon="bi-airplane-fill">Aircraft Being Sold / Traded</SectionLabel>
                    <div className="form-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Manufacturer <span className="req">*</span></label>
                        <input className="form-control" required={isSeller && form.inquiry_type === 'sell'} value={form.aircraft_make} onChange={e => set('aircraft_make', e.target.value)} placeholder="e.g. Gulfstream, Bombardier, Dassault" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Model <span className="req">*</span></label>
                        <input className="form-control" required={isSeller && form.inquiry_type === 'sell'} value={form.aircraft_model} onChange={e => set('aircraft_model', e.target.value)} placeholder="e.g. G700, Global 7500, Falcon 8X" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Year of Manufacture</label>
                        <input className="form-control" type="number" min="1950" max={new Date().getFullYear()} value={form.year_of_manufacture} onChange={e => set('year_of_manufacture', e.target.value)} placeholder="e.g. 2018" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Serial Number</label>
                        <input className="form-control" value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="Aircraft serial / registration" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Total Flight Hours</label>
                        <input className="form-control" type="number" min="0" value={form.total_flight_hours} onChange={e => set('total_flight_hours', e.target.value)} placeholder="Total airframe hours" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Asking Price (USD)</label>
                        <input className="form-control" type="number" min="0" value={form.asking_price_usd} onChange={e => set('asking_price_usd', e.target.value)} placeholder="Leave blank for valuation" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Message ── */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Message / Additional Details</label>
                  <textarea className="form-control" style={{ minHeight: 100 }}
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="Any additional context, timeline requirements, or questions for our sales team…" />
                </div>

                <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading
                    ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                    : <><i className="bi bi-send" /> Submit Sales Inquiry</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Process ─────────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--navy)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>The Sales Process</span>
            <h2 style={{ color: 'var(--white)' }}>From Inquiry to <em style={{ color: 'var(--gold-light)' }}>Completion</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-4" style={{ marginTop: '3rem' }}>
            {[
              { step: '01', icon: 'bi-chat-dots', title: 'Initial Consultation', desc: 'A dedicated sales advisor contacts you to understand your requirements, timeline, and budget.' },
              { step: '02', icon: 'bi-search', title: 'Market Search / Listing', desc: 'We source matching aircraft from our global network, or prepare your aircraft for discreet market listing.' },
              { step: '03', icon: 'bi-clipboard-check', title: 'Due Diligence', desc: 'Pre-purchase inspection, records review, title search, and independent airworthiness assessment.' },
              { step: '04', icon: 'bi-file-earmark-check', title: 'Closing & Delivery', desc: 'Escrow management, contract execution, registration transfer, and aircraft delivery coordination.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                  <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
                  </div>
                  <span style={{ position: 'absolute', top: -6, right: -10, fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', background: 'rgba(196,160,90,0.15)', padding: '1px 6px', borderRadius: 4 }}>{step}</span>
                </div>
                <h4 style={{ color: 'var(--white)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}