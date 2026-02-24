// src/pages/membership/ClientDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientDashboard, getPaymentHistory, getSavedRoutes, cancelBooking } from '../../services/api'

function StatCard({ icon, label, value, sub, colour }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div style={{ width: 40, height: 40, background: 'var(--gold-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1rem' }} />
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: colour || 'var(--navy)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>{sub}</div>}
    </div>
  )
}

const STATUS_COLOURS = {
  confirmed:  { bg: '#EBF7F1', text: '#1a8754' },
  pending:    { bg: '#FFFBEB', text: '#92400E' },
  in_flight:  { bg: '#EFF6FF', text: '#1D4ED8' },
  completed:  { bg: '#F3F4F6', text: '#374151' },
  cancelled:  { bg: '#FEF2F2', text: '#991B1B' },
}

export default function ClientDashboard() {
  const [data, setData]         = useState(null)
  const [payments, setPayments] = useState([])
  const [routes, setRoutes]     = useState([])
  const [tab, setTab]           = useState('overview')
  const [loading, setLoading]   = useState(true)
  const navigate                = useNavigate()

  const user = JSON.parse(localStorage.getItem('vj_user') || 'null')

  useEffect(() => {
    if (!user || user.role !== 'client') { navigate('/membership/login'); return }
    Promise.all([
      getClientDashboard(),
      getPaymentHistory(),
      getSavedRoutes(),
    ]).then(([dash, pay, rts]) => {
      setData(dash)
      setPayments(Array.isArray(pay) ? pay : pay.results || [])
      setRoutes(Array.isArray(rts) ? rts : rts.results || [])
    }).catch(() => navigate('/membership/login'))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" />
    </div>
  )
  if (!data) return null

  const { membership, upcoming_bookings = [], total_flights, total_spent_usd, renewal_alert, days_remaining } = data
  const tierColour = { basic: '#6CB4E4', premium: '#C9A84C', corporate: '#0b1d3a' }[membership?.tier?.name] || 'var(--navy)'

  const TABS = [
    { id: 'overview',  label: 'Overview',       icon: 'bi-grid' },
    { id: 'bookings',  label: 'Bookings',        icon: 'bi-calendar3' },
    { id: 'payments',  label: 'Payment History', icon: 'bi-receipt' },
    { id: 'routes',    label: 'Saved Routes',    icon: 'bi-bookmarks' },
  ]

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ background: 'var(--navy)', padding: '2rem 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Member Dashboard</div>
              <h2 style={{ color: 'white', margin: 0 }}>Welcome back, {user?.first_name || 'Member'}</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <Link to="/membership/book" className="btn btn-gold">
                <i className="bi bi-airplane" /> Book Flight
              </Link>
              <Link to="/membership/plans" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius)', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                <i className="bi bi-shield-check" /> Upgrade
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: tab === t.id ? 'white' : 'transparent', color: tab === t.id ? 'var(--navy)' : 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'var(--transition)' }}>
                <i className={`bi ${t.icon}`} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>

        {/* Renewal alert */}
        {renewal_alert && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '0.9rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#92400E', fontSize: '0.875rem', fontWeight: 500 }}>
              <i className="bi bi-exclamation-triangle-fill" />
              Your membership expires in <strong>{days_remaining} day{days_remaining !== 1 ? 's' : ''}</strong>.
            </div>
            <Link to="/membership/plans" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', textDecoration: 'underline' }}>
              Renew now →
            </Link>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Membership card */}
            {membership ? (
              <div style={{ background: `linear-gradient(135deg, ${tierColour} 0%, ${tierColour}cc 100%)`, borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Active Membership</div>
                  <h3 style={{ color: 'white', margin: '0 0 0.3rem', fontSize: '1.6rem' }}>{membership.tier_name}</h3>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem' }}>
                    Valid until {membership.end_date} · {days_remaining} days remaining
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', background: '#22C55E', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>● ACTIVE</span>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem' }}>Ref: {String(membership.reference).slice(0, 8)}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--white)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                <i className="bi bi-shield" style={{ fontSize: '2rem', color: 'var(--gray-300)', display: 'block', marginBottom: '0.75rem' }} />
                <h4>No Active Membership</h4>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Subscribe to a plan to start booking private flights.</p>
                <Link to="/membership/plans" className="btn btn-navy"><i className="bi bi-shield-check" /> View Plans</Link>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard icon="bi-airplane"   label="Total Flights"  value={total_flights}  sub="All completed bookings" />
              <StatCard icon="bi-cash-stack" label="Total Spent"    value={`$${Number(total_spent_usd || 0).toLocaleString()}`} sub="Lifetime bookings value" />
              <StatCard icon="bi-calendar3"  label="Upcoming"       value={upcoming_bookings.length} sub="Confirmed flights" />
              <StatCard icon="bi-clock"      label="Days Remaining" value={days_remaining ?? '—'} sub="Membership validity" />
            </div>

            {/* Upcoming flights */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Upcoming Flights</h3>
                <button onClick={() => setTab('bookings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>View all →</button>
              </div>
              {upcoming_bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--gray-400)' }}>
                  <i className="bi bi-airplane" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-200)' }} />
                  No upcoming flights.
                  <br />
                  <Link to="/membership/book" style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.875rem' }}>Book your first flight →</Link>
                </div>
              ) : upcoming_bookings.slice(0, 5).map(b => {
                const sc = STATUS_COLOURS[b.status] || STATUS_COLOURS.pending
                return (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {b.origin} <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.75rem' }} /> {b.destination}
                      </div>
                      <div style={{ fontSize: '0.77rem', color: 'var(--gray-400)' }}>
                        {b.aircraft_name} · {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>${Number(b.gross_amount_usd).toLocaleString()}</div>
                      <span style={{ fontSize: '0.68rem', background: sc.bg, color: sc.text, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>{b.status_display || b.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>All Bookings</h3>
            {[...upcoming_bookings].length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-calendar-x" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-200)' }} />
                No bookings yet. <Link to="/membership/book" style={{ color: 'var(--navy)', fontWeight: 600 }}>Book a flight →</Link>
              </div>
            ) : upcoming_bookings.map(b => {
              const sc = STATUS_COLOURS[b.status] || STATUS_COLOURS.pending
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                      {b.origin} → {b.destination}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>
                      <i className="bi bi-airplane" /> {b.aircraft_name} &nbsp;·&nbsp;
                      <i className="bi bi-people" /> {b.passenger_count} pax &nbsp;·&nbsp;
                      {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)', fontFamily: 'monospace' }}>Ref: {String(b.reference).slice(0, 12)}…</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>${Number(b.gross_amount_usd).toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', background: sc.bg, color: sc.text, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>{b.status_display || b.status}</span>
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={async () => { if (window.confirm('Cancel this booking?')) { await cancelBooking(b.id); window.location.reload() } }}
                        style={{ background: 'none', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab === 'payments' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Payment History</h3>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-receipt" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-200)' }} />
                No payments yet.
              </div>
            ) : payments.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{p.type_display || p.payment_type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {new Date(p.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    {p.description && ` · ${p.description}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>${Number(p.amount_usd).toLocaleString()}</div>
                  <span style={{ fontSize: '0.68rem', background: p.status === 'succeeded' ? '#EBF7F1' : '#FEF2F2', color: p.status === 'succeeded' ? '#1a8754' : '#991B1B', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    {p.status_display || p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SAVED ROUTES TAB ── */}
        {tab === 'routes' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Saved Routes</h3>
            {routes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-bookmarks" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-200)' }} />
                No saved routes yet. Save frequent routes when booking.
              </div>
            ) : routes.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{r.origin} → {r.destination}</div>
                </div>
                <Link to={`/membership/book?origin=${encodeURIComponent(r.origin)}&destination=${encodeURIComponent(r.destination)}`}
                  className="btn btn-outline-navy" style={{ fontSize: '0.78rem', padding: '0.3rem 0.85rem' }}>
                  <i className="bi bi-airplane" /> Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}