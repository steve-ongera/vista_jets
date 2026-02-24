// src/pages/membership/ClientDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientDashboard, getPaymentHistory, getSavedRoutes, cancelBooking } from '../../services/api'
import '../../styles/membership_styles.css'

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV = [
  { section: 'Dashboard' },
  { id: 'overview',  label: 'Overview',        icon: 'bi-grid-1x2' },
  { section: 'Travel' },
  { id: 'bookings',  label: 'Bookings',         icon: 'bi-calendar3' },
  { id: 'payments',  label: 'Payment History',  icon: 'bi-receipt' },
  { id: 'routes',    label: 'Saved Routes',     icon: 'bi-bookmarks' },
]

// ── Small helpers ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`mem-stat-card ${accent || ''}`}>
      <div className="mem-stat-icon"><i className={`bi ${icon}`} /></div>
      <div className="mem-stat-label">{label}</div>
      <div className="mem-stat-value">{value}</div>
      {sub && <div className="mem-stat-sub">{sub}</div>}
    </div>
  )
}

function EmptyState({ icon, message, action }) {
  return (
    <div className="mem-empty">
      <i className={`bi ${icon}`} />
      <p>{message}</p>
      {action}
    </div>
  )
}

// ── Status badges ──────────────────────────────────────────────────────────
const STATUS_BADGE = {
  confirmed:  'mem-badge-green',
  pending:    'mem-badge-orange',
  in_flight:  'mem-badge-blue',
  completed:  'mem-badge-gray',
  cancelled:  'mem-badge-red',
}

const TIER_COLOUR = {
  basic:     '#6CB4E4',
  premium:   '#C9A84C',
  corporate: '#0b1d3a',
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ClientDashboard() {
  const [data, setData]         = useState(null)
  const [payments, setPayments] = useState([])
  const [routes, setRoutes]     = useState([])
  const [tab, setTab]           = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const changeTab = (id) => { setTab(id); setSidebarOpen(false) }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 68 }}>
      <span className="spinner" />
    </div>
  )
  if (!data) return null

  const { membership, upcoming_bookings = [], total_flights, total_spent_usd, renewal_alert, days_remaining } = data
  const tierColour = TIER_COLOUR[membership?.tier?.name] || 'var(--navy)'

  const PAGE_TITLES = {
    overview:  { label: 'Overview',        icon: 'bi-grid-1x2' },
    bookings:  { label: 'Bookings',        icon: 'bi-calendar3' },
    payments:  { label: 'Payment History', icon: 'bi-receipt' },
    routes:    { label: 'Saved Routes',    icon: 'bi-bookmarks' },
  }
  const currentPage = PAGE_TITLES[tab]

  return (
    <div className="mem-shell">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="mem-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ────────────────── SIDEBAR ────────────────── */}
      <aside className={`mem-sidebar${sidebarOpen ? ' open' : ''}`}>

        <div className="mem-sidebar-header">
          <div className="mem-sidebar-avatar">
            <i className="bi bi-person-circle" />
          </div>
          <div className="mem-sidebar-role">
            {membership ? membership.tier_name : 'Member'}
          </div>
          <div className="mem-sidebar-name">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
          </div>
          <div className="mem-sidebar-email">{user?.email}</div>
        </div>

        <nav className="mem-nav">
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} className="mem-nav-section">{item.section}</div>
            )
            const badge = item.id === 'bookings' && upcoming_bookings.length > 0 ? upcoming_bookings.length : null
            return (
              <button key={item.id}
                className={`mem-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => changeTab(item.id)}>
                <i className={`bi ${item.icon}`} />
                {item.label}
                {badge && <span className="mem-nav-badge">{badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="mem-sidebar-footer">
          <Link to="/membership/book" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none', color: 'rgba(255,255,255,0.6)' }}>
            <i className="bi bi-airplane" /> Book a Flight
          </Link>
          <Link to="/membership/plans" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none', color: 'rgba(255,255,255,0.6)' }}>
            <i className="bi bi-shield-check" /> Upgrade Plan
          </Link>
          <Link to="/" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* ────────────────── MAIN ────────────────── */}
      <main className="mem-main">

        {/* Top bar */}
        <div className="mem-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="mem-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <i className="bi bi-list" />
            </button>
            <div className="mem-page-title">
              <i className={`bi ${currentPage.icon}`} />
              {currentPage.label}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {data && (
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--gray-400)', borderRight: '1px solid var(--gray-100)', paddingRight: '1rem', marginRight: '0.25rem', flexWrap: 'wrap' }}>
                <span><strong style={{ color: 'var(--navy)' }}>{total_flights}</strong> flights</span>
                {days_remaining != null && (
                  <span><strong style={{ color: 'var(--gold)' }}>{days_remaining}d</strong> left</span>
                )}
              </div>
            )}
            <Link to="/membership/book" className="btn btn-gold btn-sm">
              <i className="bi bi-airplane" /> Book Flight
            </Link>
          </div>
        </div>

        <div className="mem-content">

          {/* ── Alert banners ── */}
          {renewal_alert && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-exclamation-triangle-fill" />
              <span>Your membership expires in <strong>{days_remaining} day{days_remaining !== 1 ? 's' : ''}</strong>.</span>
              <Link to="/membership/plans"
                style={{ marginLeft: 'auto', fontWeight: 700, color: '#92400E', textDecoration: 'underline', fontSize: '0.82rem' }}>
                Renew now →
              </Link>
            </div>
          )}

          {/* ══════════════ OVERVIEW ══════════════ */}
          {tab === 'overview' && (
            <>
              {/* Membership card */}
              {membership ? (
                <div style={{ background: `linear-gradient(135deg, ${tierColour} 0%, ${tierColour}cc 100%)`, borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Active Membership</div>
                    <h3 style={{ color: 'white', margin: '0 0 0.3rem', fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>{membership.tier_name}</h3>
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
                <div style={{ background: 'var(--white)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                  <i className="bi bi-shield" style={{ fontSize: '2rem', color: 'var(--gray-300)', display: 'block', marginBottom: '0.75rem' }} />
                  <h4 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>No Active Membership</h4>
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>Subscribe to a plan to start booking private flights.</p>
                  <Link to="/membership/plans" className="btn btn-navy"><i className="bi bi-shield-check" /> View Plans</Link>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
                <StatCard icon="bi-airplane"    label="Total Flights"   accent="mem-stat-accent"
                  value={total_flights}                                              sub="All completed bookings" />
                <StatCard icon="bi-cash-stack"  label="Total Spent"     accent="mem-stat-accent-green"
                  value={`$${Number(total_spent_usd || 0).toLocaleString()}`}       sub="Lifetime bookings value" />
                <StatCard icon="bi-calendar3"   label="Upcoming"        accent="mem-stat-accent-blue"
                  value={upcoming_bookings.length}                                  sub="Confirmed flights" />
                <StatCard icon="bi-clock"       label="Days Remaining"  accent="mem-stat-accent-purple"
                  value={days_remaining ?? '—'}                                     sub="Membership validity" />
              </div>

              <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
                {/* Upcoming flights */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-airplane" /> Upcoming Flights</div>
                    <button onClick={() => setTab('bookings')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>
                      View all →
                    </button>
                  </div>
                  <div className="mem-panel-body">
                    {upcoming_bookings.length === 0 ? (
                      <EmptyState icon="bi-airplane" message="No upcoming flights."
                        action={<Link to="/membership/book" className="btn btn-navy btn-sm">Book your first flight →</Link>} />
                    ) : upcoming_bookings.slice(0, 5).map(b => {
                      const badgeClass = STATUS_BADGE[b.status] || 'mem-badge-gray'
                      return (
                        <div key={b.id} className="mem-row">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                              {b.origin} <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.75rem' }} /> {b.destination}
                            </div>
                            <div style={{ fontSize: '0.77rem', color: 'var(--gray-400)' }}>
                              {b.aircraft_name} · {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                              ${Number(b.gross_amount_usd).toLocaleString()}
                            </div>
                            <span className={`mem-badge ${badgeClass}`}>{b.status_display || b.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent payments */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-receipt" /> Recent Payments</div>
                    <button onClick={() => setTab('payments')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>
                      View all →
                    </button>
                  </div>
                  <div className="mem-panel-body">
                    {payments.length === 0 ? (
                      <EmptyState icon="bi-receipt" message="No payments yet." />
                    ) : payments.slice(0, 5).map(p => (
                      <div key={p.id} className="mem-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{p.type_display || p.payment_type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                            {new Date(p.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                            {p.description && ` · ${p.description}`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>${Number(p.amount_usd).toLocaleString()}</div>
                          <span className={`mem-badge ${p.status === 'succeeded' ? 'mem-badge-green' : 'mem-badge-red'}`}>
                            {p.status_display || p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title"><i className="bi bi-lightning" /> Quick Actions</div>
                </div>
                <div className="mem-panel-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/membership/book" className="btn btn-gold btn-sm" style={{ gap: '0.4rem' }}>
                    <i className="bi bi-airplane" /> Book a Flight
                  </Link>
                  <button onClick={() => setTab('bookings')} className="btn btn-outline-navy btn-sm" style={{ gap: '0.4rem' }}>
                    <i className="bi bi-calendar3" /> View Bookings
                  </button>
                  <button onClick={() => setTab('routes')} className="btn btn-outline-navy btn-sm" style={{ gap: '0.4rem' }}>
                    <i className="bi bi-bookmarks" /> Saved Routes
                  </button>
                  <Link to="/membership/plans" className="btn btn-outline-navy btn-sm" style={{ gap: '0.4rem' }}>
                    <i className="bi bi-shield-check" /> Upgrade Plan
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ══════════════ BOOKINGS TAB ══════════════ */}
          {tab === 'bookings' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-calendar3" /> All Bookings
                  {upcoming_bookings.length > 0 && (
                    <span className="mem-badge mem-badge-navy" style={{ marginLeft: '0.5rem' }}>{upcoming_bookings.length}</span>
                  )}
                </div>
                <Link to="/membership/book" className="btn btn-gold btn-sm">
                  <i className="bi bi-plus" /> Book Flight
                </Link>
              </div>
              <div className="mem-panel-body">
                {upcoming_bookings.length === 0 ? (
                  <EmptyState icon="bi-calendar-x" message="No bookings yet."
                    action={<Link to="/membership/book" className="btn btn-navy btn-sm">Book a flight →</Link>} />
                ) : upcoming_bookings.map(b => {
                  const badgeClass = STATUS_BADGE[b.status] || 'mem-badge-gray'
                  return (
                    <div key={b.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--navy)' }}>
                            {b.origin} <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> {b.destination}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>
                            <i className="bi bi-airplane" style={{ color: 'var(--gold)' }} /> {b.aircraft_name} &nbsp;·&nbsp;
                            <i className="bi bi-people" style={{ color: 'var(--gold)' }} /> {b.passenger_count} pax &nbsp;·&nbsp;
                            {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)', fontFamily: 'monospace' }}>
                            Ref: {String(b.reference).slice(0, 12)}…
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                          <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                            ${Number(b.gross_amount_usd).toLocaleString()}
                          </span>
                          <span className={`mem-badge ${badgeClass}`}>{b.status_display || b.status}</span>
                          {['pending', 'confirmed'].includes(b.status) && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Cancel this booking?')) {
                                  await cancelBooking(b.id)
                                  window.location.reload()
                                }
                              }}
                              style={{ background: 'none', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════════ PAYMENTS TAB ══════════════ */}
          {tab === 'payments' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-receipt" /> Payment History
                  {payments.length > 0 && (
                    <span className="mem-badge mem-badge-navy" style={{ marginLeft: '0.5rem' }}>{payments.length}</span>
                  )}
                </div>
              </div>
              <div className="mem-panel-body">
                {payments.length === 0 ? (
                  <EmptyState icon="bi-receipt" message="No payments yet." />
                ) : payments.map(p => (
                  <div key={p.id} className="mem-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem', color: 'var(--navy)' }}>
                        {p.type_display || p.payment_type}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {new Date(p.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                        {p.description && ` · ${p.description}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>${Number(p.amount_usd).toLocaleString()}</div>
                      <span className={`mem-badge ${p.status === 'succeeded' ? 'mem-badge-green' : 'mem-badge-red'}`}>
                        {p.status_display || p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ SAVED ROUTES TAB ══════════════ */}
          {tab === 'routes' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-bookmarks" /> Saved Routes
                  {routes.length > 0 && (
                    <span className="mem-badge mem-badge-navy" style={{ marginLeft: '0.5rem' }}>{routes.length}</span>
                  )}
                </div>
              </div>
              <div className="mem-panel-body">
                {routes.length === 0 ? (
                  <EmptyState icon="bi-bookmarks" message="No saved routes yet. Save frequent routes when booking." />
                ) : routes.map(r => (
                  <div key={r.id} className="mem-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem', color: 'var(--navy)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                        {r.origin} <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.7rem' }} /> {r.destination}
                      </div>
                    </div>
                    <Link
                      to={`/membership/book?origin=${encodeURIComponent(r.origin)}&destination=${encodeURIComponent(r.destination)}`}
                      className="btn btn-outline-navy btn-sm">
                      <i className="bi bi-airplane" /> Book
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* /mem-content */}
      </main>
    </div>
  )
}