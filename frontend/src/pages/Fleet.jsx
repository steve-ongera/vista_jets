import { useState, useEffect, useCallback } from 'react'
import {
  getAircraft, getYachts,
  createFlightBooking, createYachtCharter, createLeaseInquiry,
  searchAirports,
} from '../services/api'

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const AC_CATS = [
  { value: '', label: 'All Aircraft' },
  { value: 'light', label: 'Light Jets' },
  { value: 'midsize', label: 'Midsize Jets' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy', label: 'Heavy Jets' },
  { value: 'ultra_long', label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliners' },
]
const YACHT_CATS = [
  { value: '', label: 'All Yachts' },
  { value: 'small', label: 'Small (< 30m)' },
  { value: 'medium', label: 'Medium (30–50m)' },
  { value: 'large', label: 'Large (50–80m)' },
  { value: 'superyacht', label: 'Superyacht (80m+)' },
]
const LEASE_DURATIONS = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
  { value: 'annual',    label: 'Annual (12 months)' },
  { value: 'multi_year', label: 'Multi-Year' },
]

/* ─── Inline Airport Picker (self-contained for modal use) ──────────────────── */
function AirportPicker({ label, value, onChange, required }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy]       = useState(false)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    if (value) setQuery(`${value.city} (${value.code})`)
    else setQuery('')
  }, [value])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 2) { setResults([]); return }
      setBusy(true)
      try {
        const d = await searchAirports(query)
        setResults(d.results || d)
      } catch { setResults([]) }
      finally { setBusy(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}{required && <span className="req"> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        <i className="bi bi-geo-alt" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none', fontSize: '0.9rem' }} />
        <input
          className="form-control"
          style={{ paddingLeft: '2.25rem' }}
          value={query}
          placeholder="City or airport code"
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {busy && <span className="spinner" style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 700, background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', maxHeight: 210, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
          {results.map(a => (
            <div key={a.id} onMouseDown={() => { onChange(a); setQuery(`${a.city} (${a.code})`); setOpen(false) }}
              style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 6px', borderRadius: 3 }}>{a.code}</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)' }}>{a.name}</span>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', paddingLeft: 42 }}>{a.city}, {a.country}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Modal Shell ───────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 680 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  return (
    <>
      <style>{`@keyframes modalPop { from { opacity:0; transform:translateY(18px) scale(.97) } to { opacity:1; transform:none } }`}</style>
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(11,29,58,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
      >
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

/* ─── Reusable Success State ────────────────────────────────────────────────── */
function SuccessState({ title, message, reference, onNew, onClose }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
      <div style={{ width: 64, height: 64, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem', color: 'var(--green)' }}>
        <i className="bi bi-check-lg" />
      </div>
      <h3 style={{ marginBottom: '0.6rem' }}>{title}</h3>
      <p style={{ lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: 420, margin: '0 auto 1.5rem' }}>{message}</p>
      {reference && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '1.75rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Your Reference Number</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.87rem', color: 'var(--navy)', wordBreak: 'break-all', fontWeight: 600 }}>{reference}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>Save this to track your request at <strong>/track</strong></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline-navy btn-sm" onClick={onNew}><i className="bi bi-arrow-counterclockwise" /> New Request</button>
        <button className="btn btn-navy btn-sm" onClick={onClose}><i className="bi bi-x" /> Close</button>
      </div>
    </div>
  )
}

/* ─── Asset Banner (shown at top of each modal) ─────────────────────────────── */
function AssetBanner({ asset, type }) {
  if (!asset) return null
  const isAircraft = type === 'aircraft'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--blue-soft)', border: '1px solid #BED1EF', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
      <i className={`bi ${isAircraft ? 'bi-airplane-fill' : 'bi-water'}`} style={{ fontSize: '1.3rem', color: 'var(--navy)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.92rem' }}>{asset.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 2 }}>
          {isAircraft
            ? `${asset.category_display} · ${asset.passenger_capacity} passengers · ${asset.range_km?.toLocaleString()} km range`
            : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · ${asset.crew_count} crew`}
          {isAircraft && asset.hourly_rate_usd && ` · $${parseInt(asset.hourly_rate_usd).toLocaleString()}/hr`}
          {!isAircraft && asset.daily_rate_usd && ` · $${parseInt(asset.daily_rate_usd).toLocaleString()}/day`}
        </div>
      </div>
    </div>
  )
}

/* ─── Section label inside modal form ───────────────────────────────────────── */
function FormSection({ icon, children }) {
  return (
    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{children}
    </div>
  )
}

/* ─── MODAL 1: Book a Flight (aircraft pre-selected) ────────────────────────── */
function BookFlightModal({ open, onClose, aircraft: asset }) {
  const blank = () => ({
    guest_name: '', guest_email: '', guest_phone: '',
    trip_type: 'one_way', passenger_count: 1,
    departure_date: '', departure_time: '', return_date: '',
    catering_requested: false, ground_transport_requested: false,
    special_requests: '',
  })
  const [form, setForm]       = useState(blank)
  const [origin, setOrigin]   = useState(null)
  const [dest, setDest]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset  = ()     => { setForm(blank()); setOrigin(null); setDest(null); setSuccess(null); setError(null) }
  const close  = ()     => { reset(); onClose() }

  const submit = async (e) => {
    e.preventDefault()
    if (!origin || !dest) { setError('Please select origin and destination airports.'); return }
    setLoading(true); setError(null)
    try {
      const res = await createFlightBooking({
        ...form,
        origin: origin.id,
        destination: dest.id,
        aircraft: asset?.id,
        return_date: form.trip_type === 'round_trip' ? form.return_date : undefined,
      })
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={close}
      icon="bi-airplane"
      title={`Book — ${asset?.name || 'Aircraft'}`}
      subtitle={asset ? `${asset.category_display} · up to ${asset.passenger_capacity} passengers` : ''}
      maxWidth={700}>
      {success ? (
        <SuccessState
          title="Flight Request Submitted"
          message={success.message || 'Our specialists will contact you with a personalised quote within 2–4 hours.'}
          reference={success.booking?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} type="aircraft" />
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          {/* Contact */}
          <FormSection icon="bi-person">Your Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="req">*</span></label>
              <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Passengers <span className="req">*</span></label>
              <input className="form-control" type="number" min={1} max={asset?.passenger_capacity || 400} required value={form.passenger_count} onChange={e => set('passenger_count', parseInt(e.target.value))} />
              {asset && <span className="form-hint">Max {asset.passenger_capacity} on this aircraft</span>}
            </div>
          </div>

          {/* Route */}
          <FormSection icon="bi-map">Route & Schedule</FormSection>

          {/* Trip type pills */}
          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['one_way','One Way'],['round_trip','Round Trip'],['multi_leg','Multi-Leg']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('trip_type', v)}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form.trip_type === v ? 'var(--navy)' : 'var(--gray-200)'}`, background: form.trip_type === v ? 'var(--navy)' : 'transparent', color: form.trip_type === v ? 'white' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {l}
              </button>
            ))}
          </div>

          <div className="form-grid" style={{ marginBottom: form.trip_type === 'round_trip' ? '0.85rem' : '1.5rem' }}>
            <AirportPicker label="From" value={origin} onChange={setOrigin} required />
            <AirportPicker label="To" value={dest} onChange={setDest} required />
            <div className="form-group">
              <label className="form-label">Departure Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.departure_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('departure_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <input className="form-control" type="time" value={form.departure_time} onChange={e => set('departure_time', e.target.value)} />
            </div>
          </div>

          {form.trip_type === 'round_trip' && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Return Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.return_date} min={form.departure_date || new Date().toISOString().split('T')[0]} onChange={e => set('return_date', e.target.value)} />
            </div>
          )}

          {/* Add-ons */}
          <FormSection icon="bi-stars">Add-ons</FormSection>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[['catering_requested','bi-cup-hot','In-Flight Catering'],['ground_transport_requested','bi-car-front','Ground Transport']].map(([k, icon, label]) => (
              <button key={k} type="button"
                onClick={() => set(k, !form[k])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form[k] ? 'var(--navy)' : 'var(--gray-200)'}`, background: form[k] ? 'var(--blue-soft)' : 'transparent', color: form[k] ? 'var(--navy)' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                <i className={`bi ${icon}`} style={{ color: form[k] ? 'var(--navy)' : 'var(--gold)' }} />
                {label}
                {form[k] && <i className="bi bi-check" />}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Special Requests</label>
            <textarea className="form-control" style={{ minHeight: 75 }} value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Dietary requirements, seating preferences, special occasions…" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline-navy" onClick={close} style={{ flex: '0 0 auto' }}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</> : <><i className="bi bi-send" /> Submit Flight Request</>}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/* ─── MODAL 2: Charter a Yacht (yacht pre-selected) ─────────────────────────── */
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
    <Modal open={open} onClose={close}
      icon="bi-water"
      title={`Charter — ${asset?.name || 'Yacht'}`}
      subtitle={asset ? `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · ${asset.crew_count} crew` : ''}
      maxWidth={700}>
      {success ? (
        <SuccessState
          title="Charter Request Received"
          message={success.message || 'Our yacht specialists will respond with a tailored proposal within 4 hours.'}
          reference={success.charter?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} type="yacht" />
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <FormSection icon="bi-person">Contact Details</FormSection>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
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

          <FormSection icon="bi-map">Voyage Details</FormSection>
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

/* ─── MODAL 3: Lease (aircraft or yacht pre-selected) ───────────────────────── */
function LeaseModal({ open, onClose, asset, assetType }) {
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
  const isAc  = assetType === 'aircraft'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await createLeaseInquiry({
        ...form,
        asset_type: assetType,
        aircraft: isAc ? asset?.id : undefined,
        yacht: !isAc ? asset?.id : undefined,
      })
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={close}
      icon="bi-file-earmark-text"
      title={`Lease — ${asset?.name || (isAc ? 'Aircraft' : 'Yacht')}`}
      subtitle={asset ? (isAc ? `${asset.category_display} · ${asset.passenger_capacity} passengers` : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests`) : ''}
      maxWidth={660}>
      {success ? (
        <SuccessState
          title="Lease Inquiry Submitted"
          message={success.message || 'Our leasing team will respond within 24 hours with a tailored program proposal.'}
          reference={success.inquiry?.reference}
          onNew={reset}
          onClose={close}
        />
      ) : (
        <form onSubmit={submit}>
          {/* Asset banner — gold tint for lease */}
          {asset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
              <i className={`bi ${isAc ? 'bi-airplane' : 'bi-water'}`} style={{ fontSize: '1.3rem', color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#7A5C22', fontSize: '0.92rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9A7530', marginTop: 2 }}>
                  {isAc
                    ? `${asset.category_display} · ${asset.passenger_capacity} pax · ${asset.range_km?.toLocaleString()} km · $${parseInt(asset.hourly_rate_usd).toLocaleString()}/hr`
                    : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · $${parseInt(asset.daily_rate_usd).toLocaleString()}/day`
                  }
                </div>
              </div>
            </div>
          )}
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

          <FormSection icon="bi-person">Contact Details</FormSection>
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

          <FormSection icon="bi-calendar">Lease Program</FormSection>
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
              placeholder={isAc ? 'Typical routes, estimated hours/month, corporate or personal travel, domestic or international…' : 'Preferred cruising grounds, season length, typical group size, nature of voyages…'} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Additional Notes</label>
            <textarea className="form-control" style={{ minHeight: 70 }} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} placeholder="Customisation, branding, crew languages, special requirements…" />
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

/* ─── Spec chip ─────────────────────────────────────────────────────────────── */
function Spec({ icon, text }) {
  return (
    <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} /> {text}
    </span>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────────── */
export default function Fleet() {
  const [tab, setTab]           = useState('aircraft')
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts]     = useState([])
  const [acFilter, setAcFilter] = useState('')
  const [yFilter, setYFilter]   = useState('')
  const [loading, setLoading]   = useState(false)

  // { type: 'book-flight' | 'charter-yacht' | 'lease-aircraft' | 'lease-yacht', asset }
  const [modal, setModal] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAircraft(acFilter ? `?category=${acFilter}` : ''),
      getYachts(yFilter ? `?size_category=${yFilter}` : ''),
    ]).then(([ac, y]) => {
      setAircraft(ac.results || ac)
      setYachts(y.results || y)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [acFilter, yFilter])

  const open  = (type, asset) => setModal({ type, asset })
  const close = useCallback(() => setModal(null), [])

  return (
    <div style={{ paddingTop: '68px' }}>
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-grid-3x3-gap" /> Fleet Catalogue</span>
          <h1>Our <em style={{ color: 'var(--gold-light)' }}>Fleet</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 560 }}>
            Every aircraft and yacht in the VistaJets network is independently certified 
            and operated to the highest safety standards. Click <strong>Book</strong>, <strong>Charter</strong>, 
            or <strong>Lease</strong> on any listing to request in seconds — no page navigation required.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Tab nav */}
          <div className="tab-nav">
            <button className={`tab-btn${tab === 'aircraft' ? ' active' : ''}`} onClick={() => setTab('aircraft')}>
              <i className="bi bi-airplane" /> Private Jets ({loading ? '…' : aircraft.length})
            </button>
            <button className={`tab-btn${tab === 'yachts' ? ' active' : ''}`} onClick={() => setTab('yachts')}>
              <i className="bi bi-water" /> Yachts ({loading ? '…' : yachts.length})
            </button>
          </div>

          {/* ── Aircraft tab ── */}
          {tab === 'aircraft' && (
            <>
              <div className="filter-pills">
                {AC_CATS.map(({ value, label }) => (
                  <button key={value} className={`pill${acFilter === value ? ' active' : ''}`} onClick={() => setAcFilter(value)}>{label}</button>
                ))}
              </div>

              {loading
                ? <div style={{ textAlign: 'center', padding: '5rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
                : aircraft.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                    <i className="bi bi-airplane" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }} />
                    No aircraft in this category.
                  </div>
                ) : (
                  <div className="grid-3">
                    {aircraft.map(ac => (
                      <div className="card" key={ac.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        {ac.image_url
                          ? <img src={ac.image_url} alt={ac.name} className="card-img" />
                          : <div className="card-img-placeholder"><i className="bi bi-airplane" /></div>}
                        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="card-tag">{ac.category_display}</span>
                          <div className="card-title">{ac.name}</div>
                          <div className="card-meta" style={{ fontSize: '0.77rem', marginBottom: '0.75rem' }}>{ac.model}</div>

                          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                            <Spec icon="bi-people" text={`${ac.passenger_capacity} pax`} />
                            <Spec icon="bi-arrow-left-right" text={`${ac.range_km?.toLocaleString()} km`} />
                            <Spec icon="bi-speedometer2" text={`${ac.cruise_speed_kmh} km/h`} />
                          </div>

                          {ac.description && (
                            <p style={{ fontSize: '0.8rem', lineHeight: 1.65, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ac.description}
                            </p>
                          )}

                          {ac.amenities?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                              {ac.amenities.slice(0, 3).map(a => (
                                <span key={a} style={{ fontSize: '0.65rem', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 3, padding: '2px 6px', color: 'var(--gray-600)' }}>{a}</span>
                              ))}
                              {ac.amenities.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>+{ac.amenities.length - 3} more</span>}
                            </div>
                          )}

                          {/* Action buttons — bottom of card */}
                          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-navy btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => open('book-flight', ac)}>
                              <i className="bi bi-airplane" /> Book
                            </button>
                            <button
                              className="btn btn-outline-navy btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => open('lease-aircraft', ac)}>
                              <i className="bi bi-file-earmark-text" /> Lease
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}

          {/* ── Yachts tab ── */}
          {tab === 'yachts' && (
            <>
              <div className="filter-pills">
                {YACHT_CATS.map(({ value, label }) => (
                  <button key={value} className={`pill${yFilter === value ? ' active' : ''}`} onClick={() => setYFilter(value)}>{label}</button>
                ))}
              </div>

              {loading
                ? <div style={{ textAlign: 'center', padding: '5rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
                : yachts.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                    <i className="bi bi-water" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }} />
                    No yachts in this category.
                  </div>
                ) : (
                  <div className="grid-3">
                    {yachts.map(y => (
                      <div className="card" key={y.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        {y.image_url
                          ? <img src={y.image_url} alt={y.name} className="card-img" />
                          : <div className="card-img-placeholder"><i className="bi bi-water" /></div>}
                        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="card-tag">{y.size_display}</span>
                          <div className="card-title">{y.name}</div>

                          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                            <Spec icon="bi-arrows-expand-vertical" text={`${y.length_meters}m`} />
                            <Spec icon="bi-people" text={`${y.guest_capacity} guests`} />
                            <Spec icon="bi-person-badge" text={`${y.crew_count} crew`} />
                          </div>

                          {y.home_port && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="bi bi-geo-alt" style={{ color: 'var(--gold)' }} /> {y.home_port}
                            </div>
                          )}

                          {y.description && (
                            <p style={{ fontSize: '0.8rem', lineHeight: 1.65, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {y.description}
                            </p>
                          )}

                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                            ${parseInt(y.daily_rate_usd).toLocaleString()}
                            <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--gray-400)' }}>/day</span>
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-navy btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => open('charter-yacht', y)}>
                              <i className="bi bi-water" /> Charter
                            </button>
                            <button
                              className="btn btn-outline-navy btn-sm"
                              style={{ flex: 1, justifyContent: 'center' }}
                              onClick={() => open('lease-yacht', y)}>
                              <i className="bi bi-file-earmark-text" /> Lease
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}
        </div>
      </section>

      {/* ── Modals (rendered at page root, outside card DOM) ── */}
      <BookFlightModal
        open={modal?.type === 'book-flight'}
        onClose={close}
        aircraft={modal?.asset}
      />
      <CharterYachtModal
        open={modal?.type === 'charter-yacht'}
        onClose={close}
        yacht={modal?.asset}
      />
      <LeaseModal
        open={modal?.type === 'lease-aircraft'}
        onClose={close}
        asset={modal?.asset}
        assetType="aircraft"
      />
      <LeaseModal
        open={modal?.type === 'lease-yacht'}
        onClose={close}
        asset={modal?.asset}
        assetType="yacht"
      />
    </div>
  )
}