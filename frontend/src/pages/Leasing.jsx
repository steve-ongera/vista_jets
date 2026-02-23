import { useState, useEffect } from 'react'
import { createLeaseInquiry, getAircraft, getYachts } from '../services/api'

const DURATIONS = [
  { value: 'monthly',   label: 'Monthly',              desc: '1–2 months, flexible start' },
  { value: 'quarterly', label: 'Quarterly',             desc: '3-month committed program' },
  { value: 'annual',    label: 'Annual',                desc: '12-month dedicated access' },
  { value: 'multi_year', label: 'Multi-Year',           desc: 'Longest-term cost efficiency' },
]

const BENEFITS_AIRCRAFT = [
  ['bi-calendar-check', 'Guaranteed availability every time you need to fly'],
  ['bi-cash-coin',      'Cost savings of 30–60% vs equivalent charter rates'],
  ['bi-star',           'Consistent aircraft, crew, and service standards'],
  ['bi-tools',          'Full maintenance, insurance, and crew management included'],
  ['bi-building',       'Ideal for executives flying 200+ hours per year'],
]

const BENEFITS_YACHT = [
  ['bi-anchor',        'Your yacht is always ready in your preferred home port'],
  ['bi-people',        'Dedicated crew who know your preferences intimately'],
  ['bi-calendar4',     'Priority scheduling, no blackout periods'],
  ['bi-cash-stack',    'Significant savings vs high-season charter rates'],
  ['bi-shield-check',  'All maintenance, insurance, and port fees handled'],
]

export default function Leasing() {
  const [assetType, setAssetType] = useState('aircraft')
  const [aircraft, setAircraft]   = useState([])
  const [yachts, setYachts]       = useState([])
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    asset_type: 'aircraft', aircraft: '', yacht: '',
    lease_duration: 'annual', preferred_start_date: '',
    budget_range: '', usage_description: '', additional_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getAircraft().then(d => setAircraft(d.results || d)).catch(() => {})
    getYachts().then(d => setYachts(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const switchType = (type) => {
    setAssetType(type)
    set('asset_type', type)
    set('aircraft', '')
    set('yacht', '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      setSuccess(await createLeaseInquiry({ ...form, aircraft: form.aircraft || undefined, yacht: form.yacht || undefined }))
    } catch { setError('Unable to submit your inquiry. Please try again.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
      <div className="container section">
        <div className="success-card">
          <div className="success-icon" style={{ background: 'var(--gold-pale)' }}>
            <i className="bi bi-file-earmark-check" style={{ color: 'var(--gold)' }} />
          </div>
          <h2>Lease Inquiry Received</h2>
          <div className="gold-rule gold-rule-center" />
          <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{success.message}</p>
          <div className="reference-box">
            <div className="ref-label">Reference</div>
            <div className="ref-value">{success.inquiry?.reference}</div>
          </div>
          <button className="btn btn-outline-navy mt-3" onClick={() => setSuccess(null)}>
            <i className="bi bi-plus" /> Submit Another Inquiry
          </button>
        </div>
      </div>
    </div>
  )

  const benefits = assetType === 'aircraft' ? BENEFITS_AIRCRAFT : BENEFITS_YACHT

  return (
    <div style={{ paddingTop: '68px' }}>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-file-earmark-text" /> Long-Term Programs</span>
          <h1>Aircraft & Yacht <em style={{ color: 'var(--gold-light)' }}>Leasing</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 560 }}>
            For frequent travellers and corporations that demand guaranteed availability, consistent service, 
            and significant cost efficiency — our dedicated lease programs deliver ownership-level access 
            without ownership-level complexity.
          </p>
        </div>
      </div>

      {/* Why Lease */}
      <section className="section-sm" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {[['aircraft', 'bi-airplane', 'Aircraft Lease'], ['yacht', 'bi-water', 'Yacht Lease']].map(([type, icon, label]) => (
              <button key={type} onClick={() => switchType(type)}
                className={assetType === type ? 'btn btn-navy' : 'btn btn-outline-navy'}>
                <i className={`bi ${icon}`} />{label}
              </button>
            ))}
          </div>

          <div className="grid-2">
            <div>
              <span className="eyebrow">Why Lease?</span>
              <h3 style={{ marginBottom: '1.25rem' }}>
                {assetType === 'aircraft' ? 'Your Jet, Your Schedule' : 'Your Yacht, Always Ready'}
              </h3>
              <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>
                {assetType === 'aircraft'
                  ? 'Executives and corporate travel teams that fly more than 200 hours per year consistently find that a dedicated aircraft lease offers superior economics to ad-hoc charter — plus the peace of mind of knowing exactly which aircraft, crew, and service to expect every flight.'
                  : 'For those who charter the same region season after season, a dedicated yacht lease eliminates the uncertainty of availability during peak season, ensures you have a crew who knows your preferences intimately, and delivers substantial savings against summer Mediterranean charter rates.'
                }
              </p>
              <ul className="feature-list">
                {benefits.map(([icon, text]) => (
                  <li key={text}><i className={`bi ${icon}`} />{text}</li>
                ))}
              </ul>
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
              {DURATIONS.map(({ value, label, desc }) => (
                <div key={value} style={{
                  padding: '1.25rem', border: `2px solid ${form.lease_duration === value ? 'var(--navy)' : 'var(--gray-100)'}`,
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: form.lease_duration === value ? 'var(--blue-soft)' : 'var(--white)',
                  transition: 'var(--transition)',
                }} onClick={() => set('lease_duration', value)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{desc}</div>
                    </div>
                    {form.lease_duration === value && <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)', fontSize: '1.1rem' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <span className="eyebrow">Get in Touch</span>
            <h2>Submit a Lease <em>Inquiry</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>

          {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '2rem' }}>
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
                <label className="form-label">Company / Organisation <span className="req">*</span></label>
                <input className="form-control" required value={form.company} onChange={e => set('company', e.target.value)} />
              </div>
            </div>

            <hr className="hr" />

            <div className="form-grid" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">
                  {assetType === 'aircraft' ? 'Preferred Aircraft' : 'Preferred Vessel'}
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 6 }}>(optional)</span>
                </label>
                <select className="form-control"
                  value={assetType === 'aircraft' ? form.aircraft : form.yacht}
                  onChange={e => set(assetType === 'aircraft' ? 'aircraft' : 'yacht', e.target.value)}>
                  <option value="">Recommend the best option for my needs</option>
                  {(assetType === 'aircraft' ? aircraft : yachts).map(item => (
                    <option key={item.id} value={item.id}>{item.name} — {item.category_display || item.size_display}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Start Date <span className="req">*</span></label>
                <input className="form-control" type="date" required value={form.preferred_start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('preferred_start_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Budget Range</label>
                <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $50K–$100K/month" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Intended Usage <span className="req">*</span></label>
              <textarea className="form-control" required value={form.usage_description} onChange={e => set('usage_description', e.target.value)}
                placeholder={assetType === 'aircraft'
                  ? 'Describe your flight patterns — domestic, international, typical routes, estimated annual hours, number of passengers, corporate or personal use…'
                  : 'Describe your typical charter season — preferred cruising grounds, duration of use, typical party size, type of voyages (leisure, exploration, entertaining)…'}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Additional Notes or Requirements</label>
              <textarea className="form-control" value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)}
                placeholder="Specific cabin configurations, branding requirements, crew language preferences, special equipment…" />
            </div>

            <button type="submit" className="btn btn-navy btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-send" /> Submit Lease Inquiry</>}
            </button>
            <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
              Our leasing specialists will respond within 24 hours with a tailored program proposal.
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}