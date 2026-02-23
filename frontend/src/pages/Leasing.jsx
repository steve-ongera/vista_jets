import { useState, useEffect } from 'react'
import { createLeaseInquiry, getAircraft, getYachts } from '../services/api'

const DURATIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
  { value: 'annual', label: 'Annual (12 months)' },
  { value: 'multi_year', label: 'Multi-Year' },
]

export default function Leasing() {
  const [assetType, setAssetType] = useState('aircraft')
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts] = useState([])
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    asset_type: 'aircraft', aircraft: '', yacht: '',
    lease_duration: 'annual', preferred_start_date: '',
    budget_range: '', usage_description: '', additional_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAircraft().then(d => setAircraft(d.results || d)).catch(() => {})
    getYachts().then(d => setYachts(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const switchType = (type) => {
    setAssetType(type)
    set('asset_type', type)
    set('aircraft', ''); set('yacht', '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = { ...form, aircraft: form.aircraft || undefined, yacht: form.yacht || undefined }
      const res = await createLeaseInquiry(payload)
      setSuccess(res)
    } catch {
      setError('Unable to submit lease inquiry. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem' }}>
      <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
        <h2 style={{ marginBottom: '1rem' }}>Lease Inquiry Received</h2>
        <div className="divider divider-center" />
        <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{success.message}</p>
        <p style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '2rem' }}>Ref: {success.inquiry?.reference}</p>
        <button className="btn btn-outline" onClick={() => setSuccess(null)}>Submit Another Inquiry</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Long-Term Programs</span>
          <h1>Aircraft & Yacht <em style={{ color: 'var(--gold)' }}>Leasing</em></h1>
          <p style={{ marginTop: '0.5rem' }}>Dedicated access on your terms — monthly to multi-year programs.</p>
        </div>
      </div>

      {/* Benefits */}
      <section style={{ padding: '4rem 0', background: 'var(--charcoal)' }}>
        <div className="container">
          <div className="grid-3" style={{ textAlign: 'center' }}>
            {[
              { icon: '🔑', title: 'Dedicated Asset', desc: 'Your chosen aircraft or yacht — available exclusively for you.' },
              { icon: '💰', title: 'Cost Efficiency', desc: 'Long-term leasing dramatically reduces per-trip costs vs charter.' },
              { icon: '🎨', title: 'Customisation', desc: 'Interior configurations and branding tailored to your needs.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Asset type toggle */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
            {[['aircraft', '✈ Aircraft Lease'], ['yacht', '⚓ Yacht Lease']].map(([type, label]) => (
              <button key={type} type="button"
                onClick={() => switchType(type)}
                className={assetType === type ? 'btn btn-primary' : 'btn btn-ghost'}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
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
                <label className="form-label">Company *</label>
                <input className="form-input" required value={form.company} onChange={e => set('company', e.target.value)} />
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">
                  {assetType === 'aircraft' ? 'Preferred Aircraft' : 'Preferred Vessel'}
                </label>
                <select className="form-select"
                  value={assetType === 'aircraft' ? form.aircraft : form.yacht}
                  onChange={e => set(assetType === 'aircraft' ? 'aircraft' : 'yacht', e.target.value)}>
                  <option value="">Recommend best option</option>
                  {(assetType === 'aircraft' ? aircraft : yachts).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.category_display || item.size_display}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lease Duration *</label>
                <select className="form-select" value={form.lease_duration} onChange={e => set('lease_duration', e.target.value)}>
                  {DURATIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Start Date *</label>
                <input className="form-input" type="date" required value={form.preferred_start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('preferred_start_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Budget Range</label>
                <input className="form-input" value={form.budget_range}
                  onChange={e => set('budget_range', e.target.value)}
                  placeholder="e.g. $50K–$100K/month" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Intended Usage *</label>
              <textarea className="form-textarea" required value={form.usage_description}
                onChange={e => set('usage_description', e.target.value)}
                placeholder="Describe your intended use — frequency, routes, number of passengers, corporate vs personal..." />
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Additional Notes</label>
              <textarea className="form-textarea" value={form.additional_notes}
                onChange={e => set('additional_notes', e.target.value)}
                placeholder="Customisation requirements, branding, specific features..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              {loading ? <><span className="loading-spinner" /> Submitting...</> : 'Submit Lease Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}