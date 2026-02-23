import { useState, useEffect, useCallback } from 'react'
import { createYachtCharter, createLeaseInquiry, getYachts } from '../services/api'

const DESTINATIONS = [
  { icon: '🏖', name: 'Mediterranean', desc: 'French Riviera, Amalfi, Greek Islands' },
  { icon: '🏝', name: 'Caribbean',     desc: 'BVI, St Barts, Bahamas, Anguilla' },
  { icon: '🏔', name: 'Indian Ocean',  desc: 'Maldives, Seychelles, Mauritius' },
  { icon: '🌊', name: 'Northern Europe', desc: 'Norwegian Fjords, Iceland, Scotland' },
]

const LEASE_DURATIONS = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
  { value: 'annual',    label: 'Annual (12 months)' },
  { value: 'multi_year', label: 'Multi-Year' },
]

/* ─── Modal Shell ────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 680 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null
  return (
    <>
      <style>{`@keyframes modalPop{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div onClick={e => e.target === e.currentTarget && onClose()}
        style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(11,29,58,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)', animation: 'modalPop 0.25s var(--ease)' }}>
          {/* Header */}
          <div style={{ padding: '1.4rem 1.75rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: 'var(--gold)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.2 }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 3 }}>{subtitle}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1.2rem', padding: '0.25rem', lineHeight: 1, flexShrink: 0 }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', padding: '1.6rem 1.75rem', flex: 1 }}>{children}</div>
        </div>
      </div>
    </>
  )
}

/* ─── Success State ──────────────────────────────────────────────────────────── */
function SuccessState({ title, message, reference, onNew, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <div style={{ width: 64, height: 64, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem', color: 'var(--green)' }}>
        <i className="bi bi-check-lg" />
      </div>
      <h3 style={{ marginBottom: '0.6rem' }}>{title}</h3>
      <p style={{ lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>{message}</p>
      {reference && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1.75rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Reference Number</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.87rem', color: 'var(--navy)', wordBreak: 'break-all', fontWeight: 600 }}>{reference}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>Save this to track your booking at <strong>/track</strong></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline-navy btn-sm" onClick={onNew}><i className="bi bi-arrow-counterclockwise" /> New Request</button>
        <button className="btn btn-navy btn-sm" onClick={onClose}><i className="bi bi-x" /> Close</button>
      </div>
    </div>
  )
}

/* ─── Asset Banner ───────────────────────────────────────────────────────────── */
function AssetBanner({ asset }) {
  if (!asset) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--blue-soft)', border: '1px solid #BED1EF', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
      <i className="bi bi-water" style={{ fontSize: '1.3rem', color: 'var(--navy)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.92rem' }}>{asset.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 2 }}>
          {asset.size_display} · {asset.length_meters}m · {asset.guest_capacity} guests · {asset.crew_count} crew
          {asset.daily_rate_usd && ` · $${parseInt(asset.daily_rate_usd).toLocaleString()}/day`}
        </div>
      </div>
    </div>
  )
}

/* ─── Charter Yacht Modal ────────────────────────────────────────────────────── */
function CharterYachtModal({ open, onClose, yacht: asset }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '',
    departure_port: '', destination_port: '',
    charter_start: '', charter_end: '',
    guest_count: 2, itinerary_description: '', special_requests: '',
  })
  const [form, setForm]       = useState(blank)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

  const nights = () => {
    if (form.charter_start && form.charter_end) {
      const n = (new Date(form.charter_end) - new Date(form.charter_start)) / 86400000
      return n > 0 ? n : null
    }
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await createYachtCharter({ ...form, yacht: asset?.id })
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={close} icon="bi-water"
      title={`Charter — ${asset?.name || 'Yacht'}`}
      subtitle={asset ? `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests` : ''}
      maxWidth={700}>
      {success ? (
        <SuccessState title="Charter Request Received"
          message={success.message || 'Our yacht specialists will respond with a tailored proposal within 4 hours.'}
          reference={success.charter?.reference} onNew={reset} onClose={close} />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} />
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <i className="bi bi-person" style={{ color: 'var(--gold)' }} />Contact Details
          </div>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Number of Guests <span className="req">*</span></label>
              <input className="form-control" type="number" min={1} max={asset?.guest_capacity || 200} required value={form.guest_count} onChange={e => set('guest_count', parseInt(e.target.value))} />
              {asset && <span className="form-hint">Max {asset.guest_capacity} guests on this vessel</span>}
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <i className="bi bi-map" style={{ color: 'var(--gold)' }} />Voyage Details
          </div>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Departure Port <span className="req">*</span></label>
              <input className="form-control" required value={form.departure_port} onChange={e => set('departure_port', e.target.value)} placeholder="e.g. Monaco, Mykonos, Miami" />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Port</label>
              <input className="form-control" value={form.destination_port} onChange={e => set('destination_port', e.target.value)} placeholder="Or return to departure port" />
            </div>
            <div className="form-group">
              <label className="form-label">Charter Start <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.charter_start} min={new Date().toISOString().split('T')[0]} onChange={e => set('charter_start', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Charter End <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.charter_end} min={form.charter_start || new Date().toISOString().split('T')[0]} onChange={e => set('charter_end', e.target.value)} />
            </div>
          </div>
          {nights() && (
            <div style={{ background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 'var(--radius)', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#7A5C22', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-moon-stars" />
              <strong>{nights()} night{nights() > 1 ? 's' : ''}</strong>
              {asset?.daily_rate_usd && <span style={{ color: '#9A7530' }}> — estimated ${(nights() * parseInt(asset.daily_rate_usd)).toLocaleString()} before crew & provisions</span>}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Itinerary Ideas</label>
            <textarea className="form-control" style={{ minHeight: 75 }} value={form.itinerary_description} onChange={e => set('itinerary_description', e.target.value)} placeholder="Route preferences, island stops, diving, water sports…" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Special Requests</label>
            <textarea className="form-control" style={{ minHeight: 75 }} value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Dietary requirements, celebrations, chef preferences…" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline-navy" onClick={close} style={{ flex: '0 0 auto' }}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-send" /> Submit Charter Request</>}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/* ─── Lease Modal ────────────────────────────────────────────────────────────── */
function LeaseModal({ open, onClose, asset }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    lease_duration: 'annual', preferred_start_date: '',
    budget_range: '', usage_description: '', additional_notes: '',
  })
  const [form, setForm]       = useState(blank)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await createLeaseInquiry({
        ...form,
        asset_type: 'yacht',
        yacht: asset?.id,
      })
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={close} icon="bi-file-earmark-text"
      title={`Lease — ${asset?.name || 'Yacht'}`}
      subtitle={asset ? `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests` : ''}
      maxWidth={660}>
      {success ? (
        <SuccessState title="Lease Inquiry Submitted"
          message={success.message || 'Our leasing team will respond within 24 hours with a tailored program proposal.'}
          reference={success.inquiry?.reference} onNew={reset} onClose={close} />
      ) : (
        <form onSubmit={submit}>
          {/* Gold banner */}
          {asset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
              <i className="bi bi-water" style={{ fontSize: '1.3rem', color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#7A5C22', fontSize: '0.92rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9A7530', marginTop: 2 }}>
                  {asset.size_display} · {asset.length_meters}m · {asset.guest_capacity} guests · ${parseInt(asset.daily_rate_usd || 0).toLocaleString()}/day
                </div>
              </div>
            </div>
          )}
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <i className="bi bi-person" style={{ color: 'var(--gold)' }} />Contact Details
          </div>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company <span className="req">*</span></label>
              <input className="form-control" required value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <i className="bi bi-calendar" style={{ color: 'var(--gold)' }} />Lease Program
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {LEASE_DURATIONS.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => set('lease_duration', value)}
                style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.82rem', fontWeight: 500, borderRadius: 'var(--radius)', border: `1.5px solid ${form.lease_duration === value ? 'var(--navy)' : 'var(--gray-200)'}`, background: form.lease_duration === value ? 'var(--blue-soft)' : 'transparent', color: form.lease_duration === value ? 'var(--navy)' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {label}
                {form.lease_duration === value && <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)' }} />}
              </button>
            ))}
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Preferred Start Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.preferred_start_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('preferred_start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Budget Range</label>
              <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $50K – $150K/month" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label">Intended Usage <span className="req">*</span></label>
            <textarea className="form-control" required style={{ minHeight: 80 }} value={form.usage_description} onChange={e => set('usage_description', e.target.value)}
              placeholder="Preferred cruising grounds, season length, group size, type of voyages…" />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Additional Notes</label>
            <textarea className="form-control" style={{ minHeight: 65 }} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} placeholder="Customisation, branding, crew language preferences…" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline-navy" onClick={close} style={{ flex: '0 0 auto' }}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-send" /> Submit Lease Inquiry</>}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/* ─── YACHT CHARTER PAGE ─────────────────────────────────────────────────────── */
export default function YachtCharter() {
  const [yachts, setYachts] = useState([])

  // modal state: { type: 'charter' | 'lease', yacht }
  const [modal, setModal] = useState(null)

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

  const openModal  = (type, yacht) => setModal({ type, yacht })
  const closeModal = useCallback(() => setModal(null), [])

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

      {/* ── Featured Vessels — WITH CHARTER & LEASE MODALS ─────────────────── */}
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
                <div className="card" key={y.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {y.image_url
                    ? <img src={y.image_url} alt={y.name} className="card-img" />
                    : <div className="card-img-placeholder"><i className="bi bi-water" /></div>}
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span className="card-tag">{y.size_display}</span>
                    <div className="card-title">{y.name}</div>
                    <div className="card-meta">
                      {y.length_meters}m &nbsp;·&nbsp; {y.guest_capacity} guests &nbsp;·&nbsp; {y.crew_count} crew
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                      ${parseInt(y.daily_rate_usd).toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--gray-400)' }}>/day</span>
                    </div>
                    {y.home_port && (
                      <p style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>
                        <i className="bi bi-geo-alt" style={{ marginRight: 4, color: 'var(--gold)' }} />{y.home_port}
                      </p>
                    )}
                    {/* Charter & Lease buttons — open modals */}
                    <div className="card-actions" style={{ marginTop: 'auto' }}>
                      <button className="btn btn-navy btn-sm" onClick={() => openModal('charter', y)}>
                        <i className="bi bi-water" /> Charter
                      </button>
                      <button className="btn btn-outline-navy btn-sm" onClick={() => openModal('lease', y)}>
                        <i className="bi bi-file-earmark-text" /> Lease
                      </button>
                    </div>
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

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      <CharterYachtModal
        open={modal?.type === 'charter'}
        onClose={closeModal}
        yacht={modal?.yacht}
      />
      <LeaseModal
        open={modal?.type === 'lease'}
        onClose={closeModal}
        asset={modal?.yacht}
      />
    </div>
  )
}
