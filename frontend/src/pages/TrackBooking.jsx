import { useState } from 'react'
import { trackFlightBooking, trackYachtCharter, getMyFlightBookings } from '../services/api'

const STATUS_MAP = {
  inquiry:   { label: 'Inquiry Received',  cls: 'status-inquiry' },
  quoted:    { label: 'Quote Sent',         cls: 'status-quoted' },
  confirmed: { label: 'Confirmed',          cls: 'status-confirmed' },
  in_flight: { label: 'In Flight',          cls: 'status-confirmed' },
  active:    { label: 'Active Charter',     cls: 'status-confirmed' },
  completed: { label: 'Completed',          cls: 'status-completed' },
  cancelled: { label: 'Cancelled',          cls: 'status-cancelled' },
  pending:   { label: 'Pending Review',     cls: 'status-inquiry' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'status-inquiry' }
  return <span className={`status-badge ${s.cls}`}><i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }} />{s.label}</span>
}

function DetailRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
        <i className={`bi ${icon}`} style={{ marginRight: 5, color: 'var(--gold)' }} />{label}
      </div>
      <div style={{ fontWeight: 500, color: 'var(--navy)', fontSize: '0.9rem' }}>{value}</div>
    </div>
  )
}

function BookingCard({ data, type }) {
  const isFlight = type === 'flight'
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-md)', marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.35rem' }}>
            {isFlight ? 'Flight Booking' : 'Yacht Charter'}
          </div>
          <code style={{ fontSize: '0.82rem', color: 'var(--navy)', background: 'var(--gray-50)', padding: '3px 8px', borderRadius: 4 }}>
            {data.reference}
          </code>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <hr className="hr" style={{ margin: '0 0 1.5rem' }} />

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <DetailRow icon="bi-person" label="Guest" value={data.guest_name} />
        <DetailRow icon="bi-envelope" label="Email" value={data.guest_email} />

        {isFlight ? (
          <>
            <DetailRow icon="bi-airplane-fill"
              label="Route"
              value={data.origin_detail && data.destination_detail
                ? `${data.origin_detail.city} (${data.origin_detail.code}) → ${data.destination_detail.city} (${data.destination_detail.code})`
                : null}
            />
            <DetailRow icon="bi-calendar" label="Departure Date" value={data.departure_date} />
            <DetailRow icon="bi-people" label="Passengers" value={data.passenger_count?.toString()} />
            {data.aircraft_detail && <DetailRow icon="bi-airplane" label="Aircraft" value={data.aircraft_detail.name} />}
            {data.trip_type && <DetailRow icon="bi-arrow-left-right" label="Trip Type" value={data.trip_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />}
          </>
        ) : (
          <>
            {data.yacht_detail && <DetailRow icon="bi-water" label="Vessel" value={data.yacht_detail.name} />}
            <DetailRow icon="bi-geo-alt" label="Departure Port" value={data.departure_port} />
            <DetailRow icon="bi-calendar" label="Charter Period"
              value={data.charter_start && data.charter_end ? `${data.charter_start} → ${data.charter_end}` : null}
            />
            <DetailRow icon="bi-people" label="Guests" value={data.guest_count?.toString()} />
          </>
        )}

        {data.quoted_price_usd && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
              <i className="bi bi-cash-coin" style={{ marginRight: 5, color: 'var(--gold)' }} />Quoted Price
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
              ${parseFloat(data.quoted_price_usd).toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--gray-400)' }}>USD</span>
            </div>
          </div>
        )}
      </div>

      {/* Status timeline */}
      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem' }}>
          <i className="bi bi-list-check" style={{ marginRight: 6, color: 'var(--gold)' }} />Booking Timeline
        </div>
        <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          {['inquiry', 'quoted', 'confirmed', isFlight ? 'in_flight' : 'active', 'completed'].map((s, i, arr) => {
            const steps = ['inquiry', 'quoted', 'confirmed', isFlight ? 'in_flight' : 'active', 'completed']
            const currentIdx = steps.indexOf(data.status)
            const stepIdx = steps.indexOf(s)
            const done = stepIdx <= currentIdx && data.status !== 'cancelled'
            const isCurrent = stepIdx === currentIdx
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 80 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: isCurrent ? 'var(--navy)' : done ? 'var(--gold)' : 'var(--gray-200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 4, flexShrink: 0,
                  }}>
                    {done ? <i className="bi bi-check" style={{ color: 'white', fontSize: '0.75rem' }} /> : <span style={{ width: 8, height: 8, background: 'white', borderRadius: '50%', display: 'block' }} />}
                  </div>
                  <div style={{ fontSize: '0.62rem', textAlign: 'center', color: done ? 'var(--navy)' : 'var(--gray-400)', fontWeight: isCurrent ? 700 : 400, lineHeight: 1.2 }}>
                    {STATUS_MAP[s]?.label || s}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: done && stepIdx < currentIdx ? 'var(--gold)' : 'var(--gray-200)', maxWidth: 30, flexShrink: 0, marginBottom: 18 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function TrackBooking() {
  const [mode, setMode]           = useState('reference')
  const [ref, setRef]             = useState('')
  const [bType, setBType]         = useState('flight')
  const [email, setEmail]         = useState('')
  const [result, setResult]       = useState(null)
  const [results, setResults]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const trackByRef = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const fn = bType === 'flight' ? trackFlightBooking : trackYachtCharter
      setResult({ data: await fn(ref.trim()), type: bType })
    } catch { setError('Booking not found. Please check your reference number and try again.') }
    finally { setLoading(false) }
  }

  const findByEmail = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setResults(null)
    try {
      const data = await getMyFlightBookings(email.trim())
      setResults(Array.isArray(data) ? data : data.results || [])
    } catch { setError('Unable to retrieve bookings for this email address.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ paddingTop: '68px' }}>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-search" /> Booking Management</span>
          <h1>Track Your <em style={{ color: 'var(--gold-light)' }}>Booking</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 500 }}>
            No account required. Enter your booking reference or the email address you used 
            to check your booking status, quote, and flight details at any time.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>

            {/* Forms */}
            <div>
              <div className="tab-nav" style={{ marginBottom: '2rem' }}>
                <button className={`tab-btn${mode === 'reference' ? ' active' : ''}`} onClick={() => { setMode('reference'); setResult(null); setError(null) }}>
                  <i className="bi bi-hash" /> By Reference
                </button>
                <button className={`tab-btn${mode === 'email' ? ' active' : ''}`} onClick={() => { setMode('email'); setResults(null); setError(null) }}>
                  <i className="bi bi-envelope" /> By Email
                </button>
              </div>

              {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

              {mode === 'reference' && (
                <form onSubmit={trackByRef}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[['flight', 'bi-airplane', 'Flight'], ['yacht', 'bi-water', 'Yacht']].map(([v, icon, label]) => (
                      <button key={v} type="button"
                        className={bType === v ? 'btn btn-navy btn-sm' : 'btn btn-outline-navy btn-sm'}
                        onClick={() => setBType(v)}>
                        <i className={`bi ${icon}`} />{label}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Booking Reference <span className="req">*</span></label>
                    <input className="form-control" required value={ref} onChange={e => setRef(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      style={{ fontFamily: 'monospace' }} />
                    <span className="form-hint">Found in your booking confirmation email.</span>
                  </div>
                  <button type="submit" className="btn btn-navy" disabled={loading || !ref.trim()} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Searching…</> : <><i className="bi bi-search" /> Track Booking</>}
                  </button>
                </form>
              )}

              {mode === 'email' && (
                <form onSubmit={findByEmail}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Your Email Address <span className="req">*</span></label>
                    <input className="form-control" type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="The email used when submitting your request" />
                  </div>
                  <button type="submit" className="btn btn-navy" disabled={loading || !email.trim()} style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Searching…</> : <><i className="bi bi-search" /> Find My Bookings</>}
                  </button>
                </form>
              )}
            </div>

            {/* Help sidebar */}
            <div>
              <div className="info-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <i className="bi bi-question-circle" style={{ color: 'var(--gold)', marginRight: 6 }} />Where is my reference?
                </div>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
                  Your booking reference is a unique identifier sent to your email address when you 
                  submitted your request. It looks like: <code style={{ background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 3, fontSize: '0.78rem' }}>3f8a2b1c-…</code>
                </p>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Booking Statuses</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {Object.entries(STATUS_MAP).slice(0, 6).map(([key, { label, cls }]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`status-badge ${cls}`} style={{ fontSize: '0.65rem' }}>{label}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                        {{
                          inquiry: 'Request received, under review',
                          quoted: 'Quote has been sent to your email',
                          confirmed: 'Booking confirmed, all set!',
                          in_flight: 'Currently in the air',
                          active: 'Currently sailing',
                          completed: 'Journey completed',
                        }[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--navy)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <i className="bi bi-headset" style={{ fontSize: '1.5rem', color: 'var(--gold-light)', marginBottom: '0.5rem', display: 'block' }} />
                <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>Need Help?</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '1rem' }}>Our team is available 24 / 7.</p>
                <a href="tel:+18005478538" className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="bi bi-telephone" /> +1 (800) 547-8538
                </a>
              </div>
            </div>
          </div>

          {/* Single result */}
          {result && <BookingCard data={result.data} type={result.type} />}

          {/* Multiple results */}
          {results !== null && (
            <div style={{ marginTop: '2rem' }}>
              {results.length === 0
                ? <div className="alert alert-info"><i className="bi bi-info-circle" /><span>No bookings found for this email address.</span></div>
                : <>
                    <h3 style={{ marginBottom: '0.5rem' }}>{results.length} Booking{results.length > 1 ? 's' : ''} Found</h3>
                    <p style={{ marginBottom: '0' }}>Showing all flight bookings associated with {email}</p>
                    {results.map(b => <BookingCard key={b.reference} data={b} type="flight" />)}
                  </>
              }
            </div>
          )}
        </div>
      </section>
    </div>
  )
}