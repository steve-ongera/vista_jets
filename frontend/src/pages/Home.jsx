import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  getAircraft, getYachts,
  createFlightBooking, createYachtCharter, createLeaseInquiry,
  searchAirports,
} from '../services/api'

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '187',    label: 'Countries Served',  icon: 'bi-globe2' },
  { value: '2,400+', label: 'Aircraft Available', icon: 'bi-airplane' },
  { value: '24/7',   label: 'Concierge Access',   icon: 'bi-headset' },
  { value: '< 4hrs', label: 'Avg Response Time',  icon: 'bi-clock' },
]

const SERVICES = [
  { icon: 'bi-airplane',        title: 'Private Jet Charter',  tagline: 'Airport to airport, worldwide',          description: 'Book a private jet from any airport to any destination worldwide. Whether you need a light jet for a regional hop or an ultra-long-range aircraft for intercontinental travel, our team finds the right aircraft at the right price — instantly.',                                                                                                 link: '/book-flight',    cta: 'Book a Flight' },
  { icon: 'bi-water',           title: 'Superyacht Charter',   tagline: 'Mediterranean, Caribbean & beyond',       description: 'Charter a superyacht for a weekend, a week, or the entire season. From intimate sailing yachts to 130-metre flagship vessels, our fleet covers every ocean. Full crew, bespoke itineraries, and world-class provisioning included.',                                                                                                  link: '/yacht-charter',  cta: 'Charter a Yacht' },
  { icon: 'bi-file-earmark-text', title: 'Long-Term Leasing', tagline: 'Dedicated aircraft & yacht programs',     description: 'For frequent travellers and corporations, a dedicated lease offers unmatched availability and significant cost savings over ad-hoc charter. Monthly, quarterly, and multi-year programs available for aircraft and yachts.',                                                                                                            link: '/leasing',        cta: 'Explore Leasing' },
  { icon: 'bi-send',            title: 'Flight Inquiry',       tagline: 'Explore options, no commitment',          description: "Not sure of your dates or route? Send a general inquiry and one of our aviation specialists will design the perfect itinerary for you. We'll present aircraft options, pricing estimates, and routing alternatives within hours.",                                                                                                 link: '/flight-inquiry', cta: 'Send Inquiry' },
]

const WHY_US = [
  { icon: 'bi-shield-check', title: 'ARGUS Platinum Rated',   desc: 'Every operator in our network holds the highest safety certification in private aviation. Your safety is never compromised.' },
  { icon: 'bi-person-check', title: 'No Account Required',    desc: 'Submit a booking request in minutes with no registration, no membership fee, and no subscription. Luxury without the friction.' },
  { icon: 'bi-cash-coin',    title: 'Transparent Pricing',    desc: 'No hidden fees, no fuel surcharge surprises. The price you are quoted is the price you pay — with full breakdown provided.' },
  { icon: 'bi-headset',      title: '24 / 7 Concierge',       desc: "Our team doesn't sleep. Available around the clock by phone, email, or WhatsApp in English, French, Arabic, and Mandarin." },
  { icon: 'bi-geo-alt',      title: 'Remote Destinations',    desc: "We access airports others can't — private strips, short runways, high-altitude destinations. The world is genuinely open to you." },
  { icon: 'bi-star',         title: 'Tailored Experience',    desc: 'From in-flight catering curated by Michelin-starred chefs to seamless ground transport and hotel coordination — every detail attended to.' },
]

const PROCESS = [
  { step: '01', icon: 'bi-pencil-square',  title: 'Submit Your Request',    desc: 'Tell us your route, dates, and passenger count using our simple booking form. Takes under three minutes with no account needed.' },
  { step: '02', icon: 'bi-envelope-check', title: 'Receive Your Quote',     desc: 'Our specialists review available aircraft and present a tailored quote within two to four hours, complete with aircraft specifications and pricing.' },
  { step: '03', icon: 'bi-airplane-fill',  title: 'Fly in Absolute Comfort', desc: 'Confirm your booking and relax. We handle all logistics — from ground transport to in-flight dining preferences and beyond.' },
]

const LEASE_DURATIONS = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
  { value: 'annual',    label: 'Annual (12 months)' },
  { value: 'multi_year', label: 'Multi-Year' },
]

/* ─── Inline Airport Picker ──────────────────────────────────────────────────── */
function AirportPicker({ label, value, onChange, required }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy]       = useState(false)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    setQuery(value ? `${value.city} (${value.code})` : '')
  }, [value])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 2) { setResults([]); return }
      setBusy(true)
      try { setResults((await searchAirports(query)).results || []) }
      catch { setResults([]) }
      finally { setBusy(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}{required && <span className="req"> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        <i className="bi bi-geo-alt" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 700, background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
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
function AssetBanner({ asset, type }) {
  if (!asset) return null
  const isAc = type === 'aircraft'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--blue-soft)', border: '1px solid #BED1EF', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
      <i className={`bi ${isAc ? 'bi-airplane-fill' : 'bi-water'}`} style={{ fontSize: '1.3rem', color: 'var(--navy)', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.92rem' }}>{asset.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 2 }}>
          {isAc
            ? `${asset.category_display} · ${asset.passenger_capacity} passengers · ${asset.range_km?.toLocaleString()} km range`
            : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · ${asset.crew_count} crew`}
          {isAc && asset.hourly_rate_usd && ` · $${parseInt(asset.hourly_rate_usd).toLocaleString()}/hr`}
          {!isAc && asset.daily_rate_usd && ` · $${parseInt(asset.daily_rate_usd).toLocaleString()}/day`}
        </div>
      </div>
    </div>
  )
}

/* ─── Section label inside form ─────────────────────────────────────────────── */
function FormSection({ icon, children }) {
  return (
    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--navy)', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{children}
    </div>
  )
}

/* ─── Book Flight Modal ──────────────────────────────────────────────────────── */
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

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setOrigin(null); setDest(null); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

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
    <Modal open={open} onClose={close} icon="bi-airplane"
      title={`Book — ${asset?.name || 'Aircraft'}`}
      subtitle={asset ? `${asset.category_display} · up to ${asset.passenger_capacity} passengers` : ''}
      maxWidth={700}>
      {success ? (
        <SuccessState title="Flight Request Submitted"
          message={success.message || 'Our specialists will contact you with a personalised quote within 2–4 hours.'}
          reference={success.booking?.reference} onNew={reset} onClose={close} />
      ) : (
        <form onSubmit={submit}>
          <AssetBanner asset={asset} type="aircraft" />
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

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

          <FormSection icon="bi-map">Route & Schedule</FormSection>
          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['one_way','One Way'],['round_trip','Round Trip'],['multi_leg','Multi-Leg']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('trip_type', v)}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form.trip_type === v ? 'var(--navy)' : 'var(--gray-200)'}`, background: form.trip_type === v ? 'var(--navy)' : 'transparent', color: form.trip_type === v ? 'white' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {l}
              </button>
            ))}
          </div>
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
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
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Return Date <span className="req">*</span></label>
              <input className="form-control" type="date" required value={form.return_date} min={form.departure_date || new Date().toISOString().split('T')[0]} onChange={e => set('return_date', e.target.value)} />
            </div>
          )}

          <FormSection icon="bi-stars">Add-ons</FormSection>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[['catering_requested','bi-cup-hot','In-Flight Catering'],['ground_transport_requested','bi-car-front','Ground Transport']].map(([k, icon, label]) => (
              <button key={k} type="button" onClick={() => set(k, !form[k])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20, border: `1.5px solid ${form[k] ? 'var(--navy)' : 'var(--gray-200)'}`, background: form[k] ? 'var(--blue-soft)' : 'transparent', color: form[k] ? 'var(--navy)' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                <i className={`bi ${icon}`} style={{ color: form[k] ? 'var(--navy)' : 'var(--gold)' }} />{label}
                {form[k] && <i className="bi bi-check" />}
              </button>
            ))}
          </div>

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
          <AssetBanner asset={asset} type="yacht" />
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

/* ─── Lease Modal ────────────────────────────────────────────────────────────── */
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
  const isAc = assetType === 'aircraft'

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError(null) }
  const close = ()     => { reset(); onClose() }

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
    <Modal open={open} onClose={close} icon="bi-file-earmark-text"
      title={`Lease — ${asset?.name || (isAc ? 'Aircraft' : 'Yacht')}`}
      subtitle={asset ? (isAc ? `${asset.category_display} · ${asset.passenger_capacity} passengers` : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests`) : ''}
      maxWidth={660}>
      {success ? (
        <SuccessState title="Lease Inquiry Submitted"
          message={success.message || 'Our leasing team will respond within 24 hours with a tailored program proposal.'}
          reference={success.inquiry?.reference} onNew={reset} onClose={close} />
      ) : (
        <form onSubmit={submit}>
          {/* Gold banner for lease */}
          {asset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.6rem' }}>
              <i className={`bi ${isAc ? 'bi-airplane' : 'bi-water'}`} style={{ fontSize: '1.3rem', color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#7A5C22', fontSize: '0.92rem' }}>{asset.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9A7530', marginTop: 2 }}>
                  {isAc
                    ? `${asset.category_display} · ${asset.passenger_capacity} pax · ${asset.range_km?.toLocaleString()} km · $${parseInt(asset.hourly_rate_usd || 0).toLocaleString()}/hr`
                    : `${asset.size_display} · ${asset.length_meters}m · ${asset.guest_capacity} guests · $${parseInt(asset.daily_rate_usd || 0).toLocaleString()}/day`}
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
              placeholder={isAc ? 'Typical routes, estimated hours/month, corporate or personal travel…' : 'Preferred cruising grounds, season length, group size, type of voyages…'} />
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

/* ─── HOME PAGE ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts]     = useState([])

  // { type, asset }
  const [modal, setModal] = useState(null)

  useEffect(() => {
    getAircraft().then(d => setAircraft((d.results || d).slice(0, 3))).catch(() => {})
    getYachts().then(d => setYachts((d.results || d).slice(0, 3))).catch(() => {})
  }, [])

  const open  = (type, asset) => setModal({ type, asset })
  const close = useCallback(() => setModal(null), [])

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80)` }} />
        <div className="hero-overlay" />
        <div className="container" style={{ width: '100%' }}>
          <div className="hero-content fade-up">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              <i className="bi bi-airplane" /> Private Aviation & Yacht Charter
            </span>
            <h1>The World Is Your<br /><em>Runway</em></h1>
            <p>Instant access to 2,400+ private aircraft and 800+ yachts in 187 countries. No membership. No waiting. Just seamless luxury travel tailored to you.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/book-flight" className="btn btn-gold btn-lg fade-up delay-1"><i className="bi bi-airplane" /> Book a Flight</Link>
              <Link to="/flight-inquiry" className="btn btn-white btn-lg fade-up delay-2"><i className="bi bi-send" /> General Inquiry</Link>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'fadeUp 1s ease 1s forwards', opacity: 0 }}>
          <i className="bi bi-chevron-double-down" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }} />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="grid-4">
            {STATS.map(({ value, label, icon }) => (
              <div className="stat-item" key={label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                  <div className="stat-value">{value}</div>
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">What We Offer</span>
            <h2>Luxury Travel, <em>Simplified</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 540, margin: '0 auto', fontSize: '1rem' }}>From a single flight to a season-long yacht charter or a multi-year aircraft lease, VistaJets gives you direct access to the world's finest private travel assets — without the complexity.</p>
          </div>
          <div className="grid-4" style={{ marginTop: '3rem' }}>
            {SERVICES.map(({ icon, title, tagline, description, link, cta }) => (
              <div className="card" key={title} style={{ padding: '2rem' }}>
                <div style={{ width: 52, height: 52, background: 'var(--gold-pale)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
                </div>
                <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.02em' }}>{tagline}</div>
                <p style={{ fontSize: '0.855rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>{description}</p>
                <Link to={link} className="btn btn-outline-navy btn-sm">{cta} <i className="bi bi-arrow-right" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Aircraft  ─── MODALS ON BOOK/LEASE ───────────────────── */}
      {aircraft.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <div>
                <span className="eyebrow">Private Jet Fleet</span>
                <h2>Aircraft for Every <em>Mission</em></h2>
                <div className="gold-rule" />
                <p style={{ maxWidth: 500 }}>
                  From nimble light jets perfect for European city hops to ultra-long-range flagships 
                  that connect New York to Singapore nonstop — our fleet covers every range, 
                  cabin size, and budget.
                </p>
              </div>
              <Link to="/fleet" className="btn btn-outline-navy">View Full Fleet <i className="bi bi-arrow-right" /></Link>
            </div>

            <div className="grid-3">
              {aircraft.map(ac => (
                <div className="card" key={ac.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {ac.image_url
                    ? <img src={ac.image_url} alt={ac.name} className="card-img" />
                    : <div className="card-img-placeholder"><i className="bi bi-airplane" /></div>}
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span className="card-tag">{ac.category_display}</span>
                    <div className="card-title">{ac.name}</div>
                    <div className="card-meta" style={{ marginBottom: '1rem' }}>
                      <i className="bi bi-people" style={{ marginRight: 5 }} />{ac.passenger_capacity} passengers
                      <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>·</span>
                      <i className="bi bi-arrow-left-right" style={{ marginRight: 5 }} />{ac.range_km?.toLocaleString()} km range
                    </div>
                    {/* ← buttons now open modals */}
                    <div className="card-actions" style={{ marginTop: 'auto' }}>
                      <button className="btn btn-navy btn-sm" onClick={() => open('book-flight', ac)}>
                        <i className="bi bi-airplane" /> Book
                      </button>
                      <button className="btn btn-outline-navy btn-sm" onClick={() => open('lease-aircraft', ac)}>
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

      {/* ── Why VistaJets ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">Why VistaJets</span>
            <h2>The Standard Others <em>Aspire To</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 520, margin: '0 auto' }}>With over 20 years serving heads of state, Fortune 500 executives, and discerning private travellers, VistaJets has perfected what private travel should feel like.</p>
          </div>
          <div className="grid-3" style={{ marginTop: '3rem' }}>
            {WHY_US.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                <div style={{ flexShrink: 0, width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Yacht CTA ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '7rem 0', overflow: 'hidden', backgroundImage: `url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,29,58,0.88) 0%, rgba(11,29,58,0.55) 100%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-water" /> Superyacht Charter</span>
          <h2 style={{ color: 'var(--white)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Set Sail on the <em style={{ color: 'var(--gold-light)' }}>World's Finest</em> Yachts</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto 2.5rem', fontSize: '1rem', lineHeight: 1.8 }}>From the turquoise waters of the Maldives to the dramatic fjords of Norway, our superyacht fleet takes you to places only accessible by sea. Fully crewed, provisioned, and ready to sail on your schedule.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/yacht-charter" className="btn btn-gold btn-lg"><i className="bi bi-water" /> Charter a Yacht</Link>
            <Link to="/fleet" className="btn btn-outline-gold btn-lg" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}>Browse Yachts</Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">The VistaJets Process</span>
            <h2>From Request to <em>Takeoff</em> in Three Steps</h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 500, margin: '0 auto' }}>We've eliminated every unnecessary step. Our booking process is designed for busy people who value their time as much as their comfort.</p>
          </div>
          <div className="grid-3" style={{ marginTop: '3.5rem' }}>
            {PROCESS.map(({ step, icon, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <div style={{ width: 72, height: 72, background: 'var(--navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <i className={`bi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--gold)' }} />
                  </div>
                  <span style={{ position: 'absolute', top: -6, right: -10, fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 6px', borderRadius: 4 }}>{step}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/book-flight" className="btn btn-navy btn-lg"><i className="bi bi-airplane" /> Begin Your Journey</Link>
          </div>
        </div>
      </section>

      {/* ── Featured Yachts  ─── MODALS ON CHARTER/LEASE ─────────────────── */}
      {yachts.length > 0 && (
        <section className="section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <div>
                <span className="eyebrow">Superyacht Fleet</span>
                <h2>Vessels Built for <em>Extraordinary</em> Voyages</h2>
                <div className="gold-rule" />
              </div>
              <Link to="/fleet" className="btn btn-outline-navy">View All Yachts <i className="bi bi-arrow-right" /></Link>
            </div>
            <div className="grid-3">
              {yachts.map(y => (
                <div className="card" key={y.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {y.image_url
                    ? <img src={y.image_url} alt={y.name} className="card-img" />
                    : <div className="card-img-placeholder"><i className="bi bi-water" /></div>}
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span className="card-tag">{y.size_display}</span>
                    <div className="card-title">{y.name}</div>
                    <div className="card-meta" style={{ marginBottom: '0.5rem' }}>
                      {y.length_meters}m &nbsp;·&nbsp; {y.guest_capacity} guests &nbsp;·&nbsp; {y.crew_count} crew
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem' }}>
                      From ${parseInt(y.daily_rate_usd).toLocaleString()}
                      <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.78rem' }}>/day</span>
                    </div>
                    {/* ← buttons now open modals */}
                    <div className="card-actions" style={{ marginTop: 'auto' }}>
                      <button className="btn btn-navy btn-sm" onClick={() => open('charter-yacht', y)}>
                        <i className="bi bi-water" /> Charter
                      </button>
                      <button className="btn btn-outline-navy btn-sm" onClick={() => open('lease-yacht', y)}>
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

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--navy)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Ready to Fly?</span>
          <h2 style={{ color: 'var(--white)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Your Private Jet is <em style={{ color: 'var(--gold-light)' }}>Waiting</em></h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem', fontSize: '1rem' }}>Whether you're flying solo or bringing an entire team, VistaJets has the right aircraft at the right price. Our concierge team is standing by 24 hours a day, seven days a week.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book-flight" className="btn btn-gold btn-lg"><i className="bi bi-airplane" /> Book a Flight</Link>
            <Link to="/flight-inquiry" className="btn btn-outline-gold btn-lg" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}><i className="bi bi-send" /> Send an Inquiry</Link>
          </div>
        </div>
      </section>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
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