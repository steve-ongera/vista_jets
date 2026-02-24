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

const STATUS_META = {
  available:   { bg: '#EBF7F1', text: '#1a8754', label: 'Available' },
  in_flight:   { bg: '#EFF6FF', text: '#1D4ED8', label: 'In Flight' },
  maintenance: { bg: '#FFFBEB', text: '#92400E', label: 'Maintenance' },
  inactive:    { bg: '#F3F4F6', text: '#6B7280', label: 'Inactive' },
  pending:     { bg: '#FEF3C7', text: '#B45309', label: 'Pending Approval' },
}

export default function OwnerDashboard() {
  const [summary, setSummary]       = useState(null)
  const [aircraft, setAircraft]     = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [tab, setTab]               = useState('overview')
  const [loading, setLoading]       = useState(true)
  const [showAddLog, setShowAddLog]  = useState(false)
  const [logForm, setLogForm]        = useState({ aircraft: '', maintenance_type: 'routine', scheduled_date: '', description: '', flight_hours_at: '', cost_usd: '', status: 'scheduled' })
  const [logSaving, setLogSaving]   = useState(false)
  const navigate                    = useNavigate()

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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" />
    </div>
  )

  const TABS = [
    { id: 'overview',    label: 'Overview',     icon: 'bi-grid' },
    { id: 'fleet',       label: 'My Fleet',     icon: 'bi-airplane-engines' },
    { id: 'maintenance', label: 'Maintenance',  icon: 'bi-tools' },
  ]

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ background: 'var(--navy)', padding: '2rem 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Fleet Owner Dashboard</div>
              <h2 style={{ color: 'white', margin: 0 }}>Welcome, {user?.first_name || 'Owner'}</h2>
            </div>
            <Link to="/membership/add-aircraft" className="btn btn-gold">
              <i className="bi bi-plus-circle" /> Add Aircraft
            </Link>
          </div>
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

        {/* Maintenance alerts banner */}
        {summary?.maintenance_alerts?.length > 0 && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '0.9rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#92400E', fontSize: '1.1rem', flexShrink: 0 }} />
            <div style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: 500 }}>
              <strong>{summary.maintenance_alerts.length} aircraft</strong> have maintenance due within 7 days.{' '}
              <button onClick={() => setTab('maintenance')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontWeight: 700, textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}>
                View now →
              </button>
            </div>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && summary && (
          <>
            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard icon="bi-cash-stack"   label="Total Revenue"   value={`$${Number(summary.total_revenue_usd || 0).toLocaleString()}`} sub="After platform commission" colour="#1a8754" />
              <StatCard icon="bi-graph-up"     label="This Month"      value={`$${Number(summary.monthly_revenue_usd || 0).toLocaleString()}`} sub="Month-to-date earnings" />
              <StatCard icon="bi-speedometer"  label="Flight Hours"    value={Number(summary.total_flight_hours || 0).toFixed(1)} sub="Total across fleet" />
              <StatCard icon="bi-calendar-check" label="Upcoming"      value={summary.upcoming_flights_count || 0} sub="Confirmed bookings" />
            </div>

            {/* Fleet quick view */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Fleet Status</h3>
                <button onClick={() => setTab('fleet')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 600 }}>Manage fleet →</button>
              </div>
              {aircraft.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                  <i className="bi bi-airplane-engines" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', color: 'var(--gray-200)' }} />
                  No aircraft listed yet.{' '}
                  <Link to="/membership/add-aircraft" style={{ color: 'var(--navy)', fontWeight: 600 }}>Add your first →</Link>
                </div>
              ) : aircraft.slice(0, 4).map(a => {
                const sm = STATUS_META[a.status] || STATUS_META.inactive
                const hoursLeft = a.hours_until_maintenance ?? '—'
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{a.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>
                        {a.registration_number} · {a.category_display} · {a.base_location}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {a.maintenance_due && <span style={{ fontSize: '0.68rem', background: '#FEF2F2', color: '#991B1B', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>⚠ Maintenance Due</span>}
                      <span style={{ fontSize: '0.7rem', background: sm.bg, color: sm.text, padding: '2px 10px', borderRadius: 12, fontWeight: 700 }}>{sm.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Maintenance alerts */}
            {summary.maintenance_alerts?.length > 0 && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Upcoming Maintenance</h3>
                {summary.maintenance_alerts.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.aircraft_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>{m.type_display} · Scheduled {m.scheduled_date}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#FFFBEB', color: '#92400E', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>Scheduled</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FLEET TAB ── */}
        {tab === 'fleet' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>My Fleet ({aircraft.length})</h3>
              <Link to="/membership/add-aircraft" className="btn btn-navy" style={{ fontSize: '0.82rem' }}>
                <i className="bi bi-plus" /> Add Aircraft
              </Link>
            </div>
            {aircraft.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                No aircraft yet. <Link to="/membership/add-aircraft" style={{ color: 'var(--navy)', fontWeight: 600 }}>Add your first →</Link>
              </div>
            ) : aircraft.map(a => {
              const sm = STATUS_META[a.status] || STATUS_META.inactive
              return (
                <div key={a.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.name}</span>
                        {!a.is_approved && <span style={{ fontSize: '0.65rem', background: '#FFFBEB', color: '#92400E', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>Pending Approval</span>}
                        {a.maintenance_due && <span style={{ fontSize: '0.65rem', background: '#FEF2F2', color: '#991B1B', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>⚠ Maintenance Due</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                        {a.registration_number} · {a.model} · {a.base_location}
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {[
                          ['bi-speedometer', `${a.total_flight_hours}h total`],
                          ['bi-tools',       `${a.hours_until_maintenance ?? '—'}h to maintenance`],
                          ['bi-currency-dollar', `$${Number(a.hourly_rate_usd).toLocaleString()}/hr`],
                          ['bi-people',      `${a.passenger_capacity} pax`],
                        ].map(([icon, text]) => (
                          <span key={text} style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} /> {text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.72rem', background: sm.bg, color: sm.text, padding: '3px 12px', borderRadius: 12, fontWeight: 700 }}>{sm.label}</span>
                      <select
                        value={a.status}
                        onChange={e => changeStatus(a.id, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer', color: 'var(--navy)' }}
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
        )}

        {/* ── MAINTENANCE TAB ── */}
        {tab === 'maintenance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Maintenance Logs</h3>
              <button className="btn btn-navy" style={{ fontSize: '0.82rem' }} onClick={() => setShowAddLog(true)}>
                <i className="bi bi-plus" /> Log Maintenance
              </button>
            </div>

            {/* Add maintenance log modal */}
            {showAddLog && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 480 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0 }}>Log Maintenance</h3>
                    <button onClick={() => setShowAddLog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-400)' }}><i className="bi bi-x" /></button>
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
                          {[['routine','Routine'],['repair','Repair'],['inspection','Inspection'],['upgrade','Upgrade'],['emergency','Emergency']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
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
                      <button type="button" onClick={() => setShowAddLog(false)} className="btn" style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--navy)', justifyContent: 'center' }}>Cancel</button>
                      <button type="submit" className="btn btn-navy" style={{ flex: 1, justifyContent: 'center' }} disabled={logSaving}>
                        {logSaving ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : 'Save Log'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              {maintenance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                  <i className="bi bi-tools" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--gray-200)' }} />
                  No maintenance logs yet.
                </div>
              ) : maintenance.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.9rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>{m.aircraft_name} — {m.type_display}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>{m.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)' }}>
                      Scheduled: {m.scheduled_date}
                      {m.cost_usd && ` · Cost: $${Number(m.cost_usd).toLocaleString()}`}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: m.status === 'completed' ? '#EBF7F1' : '#FFFBEB', color: m.status === 'completed' ? '#1a8754' : '#92400E', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}