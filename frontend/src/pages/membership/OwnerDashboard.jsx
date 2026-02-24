// src/pages/membership/OwnerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getOwnerDashboard,
  getMarketplaceAircraft,
  getMaintenanceLogs,
  updateAircraftStatus,
  createMaintenanceLog,
} from '../../services/api'
import '../../styles/membership_styles.css'

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV = [
  { section: 'Dashboard' },
  { id: 'overview',     label: 'Overview',     icon: 'bi-grid-1x2' },
  { section: 'Manage' },
  { id: 'fleet',        label: 'My Fleet',     icon: 'bi-airplane-engines' },
  { id: 'maintenance',  label: 'Maintenance',  icon: 'bi-tools' },
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

// ── Status meta ────────────────────────────────────────────────────────────
const STATUS_META = {
  available:   { badgeClass: 'mem-badge-green',  label: 'Available' },
  in_flight:   { badgeClass: 'mem-badge-blue',   label: 'In Flight' },
  maintenance: { badgeClass: 'mem-badge-orange', label: 'Maintenance' },
  inactive:    { badgeClass: 'mem-badge-gray',   label: 'Inactive' },
  pending:     { badgeClass: 'mem-badge-orange', label: 'Pending Approval' },
}

// ══════════════════════════════════════════════════════════════════════════════
export default function OwnerDashboard() {
  const [summary, setSummary]         = useState(null)
  const [aircraft, setAircraft]       = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [tab, setTab]                 = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading]         = useState(true)
  const [showAddLog, setShowAddLog]   = useState(false)
  const [logForm, setLogForm]         = useState({
    aircraft: '', maintenance_type: 'routine', scheduled_date: '',
    description: '', flight_hours_at: '', cost_usd: '', status: 'scheduled',
  })
  const [logSaving, setLogSaving] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('vj_user') || 'null')

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/membership/login'); return }
    Promise.all([
      getOwnerDashboard(),
      getMarketplaceAircraft(),
      getMaintenanceLogs(),
    ]).then(([s, a, m]) => {
      setSummary(s)
      setAircraft(Array.isArray(a) ? a : a.results || [])
      setMaintenance(Array.isArray(m) ? m : m.results || [])
    }).catch(() => navigate('/membership/login'))
    .finally(() => setLoading(false))
  }, [])

  const changeStatus = async (id, newStatus) => {
    await updateAircraftStatus(id, newStatus)
    setAircraft(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  const saveLog = async (e) => {
    e.preventDefault()
    setLogSaving(true)
    try {
      await createMaintenanceLog({
        ...logForm,
        flight_hours_at: parseFloat(logForm.flight_hours_at) || 0,
        cost_usd: logForm.cost_usd || null,
      })
      setShowAddLog(false)
      setLogForm({ aircraft: '', maintenance_type: 'routine', scheduled_date: '', description: '', flight_hours_at: '', cost_usd: '', status: 'scheduled' })
      const m = await getMaintenanceLogs()
      setMaintenance(Array.isArray(m) ? m : m.results || [])
    } catch (err) {
      alert(err.message)
    } finally {
      setLogSaving(false)
    }
  }

  const changeTab = (id) => { setTab(id); setSidebarOpen(false) }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 68 }}>
      <span className="spinner" />
    </div>
  )

  const maintenanceDueCount = aircraft.filter(a => a.maintenance_due).length
  const pendingCount        = aircraft.filter(a => !a.is_approved).length

  const PAGE_TITLES = {
    overview:    { label: 'Overview',    icon: 'bi-grid-1x2' },
    fleet:       { label: 'My Fleet',   icon: 'bi-airplane-engines' },
    maintenance: { label: 'Maintenance', icon: 'bi-tools' },
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
            <i className="bi bi-airplane-engines" />
          </div>
          <div className="mem-sidebar-role">Fleet Owner</div>
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
            const badge = item.id === 'maintenance' && maintenanceDueCount > 0 ? maintenanceDueCount
                        : item.id === 'fleet'        && pendingCount > 0        ? pendingCount
                        : null
            return (
              <button key={item.id}
                className={`mem-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => changeTab(item.id)}>
                <i className={`bi ${item.icon}`} />
                {item.label}
                {badge && (
                  <span className={`mem-nav-badge${item.id === 'maintenance' ? ' red' : ''}`}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mem-sidebar-footer">
          <Link to="/membership/add-aircraft" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none', color: 'rgba(255,255,255,0.6)' }}>
            <i className="bi bi-plus-circle" /> Add Aircraft
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
            {summary && (
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--gray-400)', borderRight: '1px solid var(--gray-100)', paddingRight: '1rem', marginRight: '0.25rem', flexWrap: 'wrap' }}>
                <span><strong style={{ color: 'var(--navy)' }}>{aircraft.length}</strong> aircraft</span>
                <span><strong style={{ color: '#1a8754' }}>${Number(summary.total_revenue_usd || 0).toLocaleString()}</strong> revenue</span>
              </div>
            )}
            <Link to="/membership/add-aircraft" className="btn btn-gold btn-sm">
              <i className="bi bi-plus-circle" /> Add Aircraft
            </Link>
          </div>
        </div>

        <div className="mem-content">

          {/* ── Alert banners ── */}
          {summary?.maintenance_alerts?.length > 0 && tab !== 'maintenance' && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-exclamation-triangle-fill" />
              <span><strong>{summary.maintenance_alerts.length} aircraft</strong> have maintenance due within 7 days.</span>
              <button onClick={() => setTab('maintenance')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#92400E', textDecoration: 'underline', fontSize: '0.82rem' }}>
                View now →
              </button>
            </div>
          )}
          {pendingCount > 0 && tab !== 'fleet' && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-hourglass-split" />
              <span><strong>{pendingCount} aircraft</strong> pending admin approval.</span>
              <button onClick={() => setTab('fleet')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#92400E', textDecoration: 'underline', fontSize: '0.82rem' }}>
                View →
              </button>
            </div>
          )}

          {/* ══════════════ OVERVIEW ══════════════ */}
          {tab === 'overview' && summary && (
            <>
              <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
                <StatCard icon="bi-cash-stack"      label="Total Revenue"   accent="mem-stat-accent-green"
                  value={`$${Number(summary.total_revenue_usd || 0).toLocaleString()}`}   sub="After platform commission" />
                <StatCard icon="bi-graph-up"         label="This Month"     accent="mem-stat-accent"
                  value={`$${Number(summary.monthly_revenue_usd || 0).toLocaleString()}`} sub="Month-to-date earnings" />
                <StatCard icon="bi-speedometer"      label="Flight Hours"   accent="mem-stat-accent-blue"
                  value={Number(summary.total_flight_hours || 0).toFixed(1)}              sub="Total across fleet" />
                <StatCard icon="bi-calendar-check"   label="Upcoming"       accent="mem-stat-accent-purple"
                  value={summary.upcoming_flights_count || 0}                             sub="Confirmed bookings" />
              </div>

              <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
                {/* Fleet quick view */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-airplane-engines" /> Fleet Status</div>
                    <button onClick={() => setTab('fleet')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>
                      Manage fleet →
                    </button>
                  </div>
                  <div className="mem-panel-body">
                    {aircraft.length === 0 ? (
                      <EmptyState icon="bi-airplane-engines" message="No aircraft listed yet."
                        action={<Link to="/membership/add-aircraft" className="btn btn-navy btn-sm">Add your first →</Link>} />
                    ) : aircraft.slice(0, 4).map(a => {
                      const sm = STATUS_META[a.status] || STATUS_META.inactive
                      return (
                        <div key={a.id} className="mem-row">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{a.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>
                              {a.registration_number} · {a.category_display} · {a.base_location}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {a.maintenance_due && (
                              <span className="mem-badge mem-badge-red">⚠ Due</span>
                            )}
                            <span className={`mem-badge ${sm.badgeClass}`}>{sm.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Upcoming maintenance */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-tools" /> Upcoming Maintenance</div>
                    <button onClick={() => setTab('maintenance')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>
                      View all →
                    </button>
                  </div>
                  <div className="mem-panel-body">
                    {!summary.maintenance_alerts?.length ? (
                      <EmptyState icon="bi-check-circle" message="No upcoming maintenance — all clear!" />
                    ) : summary.maintenance_alerts.map(m => (
                      <div key={m.id} className="mem-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.aircraft_name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>
                            {m.type_display} · Scheduled {m.scheduled_date}
                          </div>
                        </div>
                        <span className="mem-badge mem-badge-orange">Scheduled</span>
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
                  {[
                    { label: 'Manage Fleet',         icon: 'bi-airplane-engines', id: 'fleet' },
                    { label: 'Maintenance Logs',      icon: 'bi-tools',            id: 'maintenance' },
                  ].map(qa => (
                    <button key={qa.id} onClick={() => setTab(qa.id)}
                      className="btn btn-outline-navy btn-sm" style={{ gap: '0.4rem' }}>
                      <i className={`bi ${qa.icon}`} /> {qa.label}
                    </button>
                  ))}
                  <Link to="/membership/add-aircraft" className="btn btn-gold btn-sm" style={{ gap: '0.4rem' }}>
                    <i className="bi bi-plus-circle" /> Add Aircraft
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ══════════════ FLEET TAB ══════════════ */}
          {tab === 'fleet' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-airplane-engines" /> My Fleet
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: '0.5rem' }}>{aircraft.length}</span>
                </div>
                <Link to="/membership/add-aircraft" className="btn btn-navy btn-sm">
                  <i className="bi bi-plus" /> Add Aircraft
                </Link>
              </div>
              <div className="mem-panel-body">
                {aircraft.length === 0 ? (
                  <EmptyState icon="bi-airplane-engines" message="No aircraft yet."
                    action={<Link to="/membership/add-aircraft" className="btn btn-navy btn-sm">Add your first →</Link>} />
                ) : aircraft.map(a => {
                  const sm = STATUS_META[a.status] || STATUS_META.inactive
                  return (
                    <div key={a.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>{a.name}</span>
                            {!a.is_approved && (
                              <span className="mem-badge mem-badge-orange">Pending Approval</span>
                            )}
                            {a.maintenance_due && (
                              <span className="mem-badge mem-badge-red">⚠ Maintenance Due</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.6rem' }}>
                            {a.registration_number} · {a.model} · {a.base_location}
                          </div>
                          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {[
                              ['bi-speedometer',     `${a.total_flight_hours}h total`],
                              ['bi-tools',           `${a.hours_until_maintenance ?? '—'}h to maintenance`],
                              ['bi-currency-dollar', `$${Number(a.hourly_rate_usd).toLocaleString()}/hr`],
                              ['bi-people',          `${a.passenger_capacity} pax`],
                            ].map(([icon, text]) => (
                              <span key={text} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} /> {text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <span className={`mem-badge ${sm.badgeClass}`}>{sm.label}</span>
                          <select
                            value={a.status}
                            onChange={e => changeStatus(a.id, e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--navy)', background: 'var(--white)' }}
                          >
                            <option value="available">Set Available</option>
                            <option value="maintenance">Set Maintenance</option>
                            <option value="inactive">Set Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════════ MAINTENANCE TAB ══════════════ */}
          {tab === 'maintenance' && (
            <>
              {/* Add maintenance log modal */}
              {showAddLog && (
                <div className="mem-modal-backdrop">
                  <div className="mem-modal">
                    <div className="mem-modal-header">
                      <div className="mem-modal-title"><i className="bi bi-tools" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />Log Maintenance</div>
                      <button className="mem-modal-close" onClick={() => setShowAddLog(false)}>
                        <i className="bi bi-x" />
                      </button>
                    </div>
                    <form onSubmit={saveLog}>
                      <div className="form-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Aircraft <span className="req">*</span></label>
                          <select className="form-control" required value={logForm.aircraft} onChange={e => setLogForm(f => ({ ...f, aircraft: e.target.value }))}>
                            <option value="">Select aircraft</option>
                            {aircraft.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Type <span className="req">*</span></label>
                          <select className="form-control" value={logForm.maintenance_type} onChange={e => setLogForm(f => ({ ...f, maintenance_type: e.target.value }))}>
                            {[['routine','Routine'],['repair','Repair'],['inspection','Inspection'],['upgrade','Upgrade'],['emergency','Emergency']].map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Scheduled Date <span className="req">*</span></label>
                          <input className="form-control" type="date" required value={logForm.scheduled_date} onChange={e => setLogForm(f => ({ ...f, scheduled_date: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Aircraft Hours At</label>
                          <input className="form-control" type="number" step="0.1" value={logForm.flight_hours_at} onChange={e => setLogForm(f => ({ ...f, flight_hours_at: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Description <span className="req">*</span></label>
                        <textarea className="form-control" required style={{ minHeight: 80 }} value={logForm.description} onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Cost (USD)</label>
                        <input className="form-control" type="number" step="0.01" value={logForm.cost_usd} onChange={e => setLogForm(f => ({ ...f, cost_usd: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" onClick={() => setShowAddLog(false)}
                          className="btn btn-sm" style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--navy)', justifyContent: 'center' }}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-navy btn-sm" style={{ flex: 1, justifyContent: 'center' }} disabled={logSaving}>
                          {logSaving
                            ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                            : <><i className="bi bi-check" /> Save Log</>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-tools" /> Maintenance Logs
                    <span className="mem-badge mem-badge-navy" style={{ marginLeft: '0.5rem' }}>{maintenance.length}</span>
                  </div>
                  <button className="btn btn-navy btn-sm" onClick={() => setShowAddLog(true)}>
                    <i className="bi bi-plus" /> Log Maintenance
                  </button>
                </div>
                <div className="mem-panel-body">
                  {maintenance.length === 0 ? (
                    <EmptyState icon="bi-tools" message="No maintenance logs yet." />
                  ) : maintenance.map(m => (
                    <div key={m.id} className="mem-row">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem', color: 'var(--navy)' }}>
                          {m.aircraft_name} — {m.type_display}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>{m.description}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                          Scheduled: {m.scheduled_date}
                          {m.cost_usd && ` · Cost: $${Number(m.cost_usd).toLocaleString()}`}
                        </div>
                      </div>
                      <span className={`mem-badge ${m.status === 'completed' ? 'mem-badge-green' : 'mem-badge-orange'}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>{/* /mem-content */}
      </main>
    </div>
  )
}