import { useState } from 'react'
import { trackFlightBooking, trackYachtCharter, getMyFlightBookings } from '../services/api'

const STATUS_LABELS = {
  inquiry: 'Inquiry Received',
  quoted: 'Quote Sent',
  confirmed: 'Confirmed',
  in_flight: 'In Flight',
  active: 'Active Charter',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending: 'Pending',
}

function StatusBadge({ status }) {
  const map = {
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }
  return (
    <span className={`status-badge ${map[status] || 'status-inquiry'}`}>
      ● {STATUS_LABELS[status] || status}
    </span>
  )
}

function BookingDetail({ booking, type }) {
  const isFlight = type === 'flight'
  return (
    <div style={{ background: 'var(--charcoal)', border: '1px solid var(--ash)', borderRadius: 4, padding: '2rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: '0.5rem' }}>
            {isFlight ? 'FLIGHT BOOKING' : 'YACHT CHARTER'}
          </div>
          <h3 style={{ fontSize: '1.1rem' }}>{booking.reference}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>GUEST</div>
          <div style={{ fontSize: '0.9rem' }}>{booking.guest_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)' }}>{booking.guest_email}</div>
        </div>

        {isFlight ? (
          <>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>ROUTE</div>
              <div style={{ fontSize: '0.9rem' }}>
                {booking.origin_detail?.city || '—'} ({booking.origin_detail?.code})
                {' → '}
                {booking.destination_detail?.city || '—'} ({booking.destination_detail?.code})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>DEPARTURE</div>
              <div style={{ fontSize: '0.9rem' }}>{booking.departure_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>PASSENGERS</div>
              <div style={{ fontSize: '0.9rem' }}>{booking.passenger_count}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>VESSEL</div>
              <div style={{ fontSize: '0.9rem' }}>{booking.yacht_detail?.name || 'To be assigned'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>CHARTER PERIOD</div>
              <div style={{ fontSize: '0.9rem' }}>{booking.charter_start} — {booking.charter_end}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>PORT</div>
              <div style={{ fontSize: '0.9rem' }}>{booking.departure_port}</div>
            </div>
          </>
        )}

        {booking.quoted_price_usd && (
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '0.25rem' }}>QUOTED PRICE</div>
            <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
              ${parseFloat(booking.quoted_price_usd).toLocaleString()} USD
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackBooking() {
  const [mode, setMode] = useState('reference')
  const [ref, setRef] = useState('')
  const [bookingType, setBookingType] = useState('flight')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trackByRef = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const fn = bookingType === 'flight' ? trackFlightBooking : trackYachtCharter
      const data = await fn(ref.trim())
      setResult({ data, type: bookingType })
    } catch {
      setError('Booking not found. Please check your reference number.')
    } finally { setLoading(false) }
  }

  const trackByEmail = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setResults(null)
    try {
      const data = await getMyFlightBookings(email.trim())
      setResults(Array.isArray(data) ? data : data.results || [])
    } catch {
      setError('Unable to retrieve bookings. Check your email and try again.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Booking Management</span>
          <h1>Track Your <em style={{ color: 'var(--gold)' }}>Booking</em></h1>
          <p style={{ marginTop: '0.5rem' }}>No account needed. Use your reference number or email to check status.</p>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="tab-nav">
            <button className={`tab-btn ${mode === 'reference' ? 'active' : ''}`} onClick={() => { setMode('reference'); setResult(null); setError(null) }}>
              Track by Reference
            </button>
            <button className={`tab-btn ${mode === 'email' ? 'active' : ''}`} onClick={() => { setMode('email'); setResults(null); setError(null) }}>
              Find by Email
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {mode === 'reference' && (
            <form onSubmit={trackByRef}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[['flight', '✈ Flight'], ['yacht', '⚓ Yacht']].map(([v, l]) => (
                    <button key={v} type="button"
                      className={bookingType === v ? 'btn btn-primary' : 'btn btn-ghost'}
                      style={{ fontSize: '0.75rem' }} onClick={() => setBookingType(v)}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Reference</label>
                  <input className="form-input" value={ref}
                    onChange={e => setRef(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !ref.trim()}>
                {loading ? <><span className="loading-spinner" /> Searching...</> : 'Track Booking'}
              </button>
            </form>
          )}

          {mode === 'email' && (
            <form onSubmit={trackByEmail}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Your Email Address</label>
                <input className="form-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="The email used when booking"
                  required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
                {loading ? <><span className="loading-spinner" /> Searching...</> : 'Find My Bookings'}
              </button>
            </form>
          )}

          {/* Single result */}
          {result && <BookingDetail booking={result.data} type={result.type} />}

          {/* Multiple results */}
          {results && (
            <div style={{ marginTop: '2rem' }}>
              {results.length === 0 ? (
                <div className="alert alert-info">No flight bookings found for this email.</div>
              ) : (
                <>
                  <h3 style={{ marginBottom: '1rem' }}>{results.length} Booking{results.length > 1 ? 's' : ''} Found</h3>
                  {results.map(b => <BookingDetail key={b.reference} booking={b} type="flight" />)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}