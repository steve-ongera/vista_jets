// src/pages/membership/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getAdminDashboard,
  getMarketplaceAircraft,
  approveAircraft,
  getDisputes,
  resolveDispute,
  getCommissionSettings,
  setCommissionRate,
  clearTokens,
} from '../../services/api'
import '../../styles/membership_styles.css'

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV = [
  { section: 'Dashboard' },
  { id: 'overview',    label: 'Overview',        icon: 'bi-grid-1x2' },
  { section: 'Manage' },
  { id: 'approvals',  label: 'Aircraft Approvals', icon: 'bi-check-circle' },
  { id: 'disputes',   label: 'Disputes',          icon: 'bi-flag' },
  { id: 'commission', label: 'Commission Rates',  icon: 'bi-percent' },
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

// ── STATUS COLOURS ──────────────────────────────────────────────────────────
const DISPUTE_STATUS = {
  open:      'mem-badge-red',
  reviewing: 'mem-badge-orange',
  resolved:  'mem-badge-green',
  closed:    'mem-badge-gray',
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [tab, setTab]             = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [summary, setSummary]     = useState(null)
  const [aircraft, setAircraft]   = useState([])
  const [disputes, setDisputes]   = useState([])
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [newRate, setNewRate]     = useState('')
  const [rateNote, setRateNote]   = useState('')
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSuccess, setRateSuccess] = useState(false)
  const [resolvingId, setResolvingId] = useState(null)
  const [resolution, setResolution]   = useState('')
  const [approving, setApproving] = useState(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('vj_user') || 'null')

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/membership/login'); return }
    Promise.all([
      getAdminDashboard(),
      getMarketplaceAircraft(),
      getDisputes(),
      getCommissionSettings(),
    ]).then(([s, a, d, c]) => {
      setSummary(s)
      setAircraft(Array.isArray(a) ? a : a.results || [])
      setDisputes(Array.isArray(d) ? d : d.results || [])
      setCommissions(Array.isArray(c) ? c : c.results || [])
    }).catch(() => navigate('/membership/login'))
    .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    setApproving(id)
    try {
      await approveAircraft(id)
      setAircraft(prev => prev.map(a => a.id === id ? { ...a, is_approved: true, status: 'available' } : a))
      setSummary(prev => prev ? { ...prev, pending_approvals: prev.pending_approvals - 1, total_aircraft: prev.total_aircraft + 1 } : prev)
    } catch (e) { alert(e.message) }
    finally { setApproving(null) }
  }

  const handleSetRate = async (e) => {
    e.preventDefault()
    setRateSaving(true)
    try {
      const r = await setCommissionRate({ rate_pct: parseFloat(newRate), notes: rateNote })
      setCommissions(prev => [r, ...prev])
      setSummary(prev => prev ? { ...prev, commission_rate: parseFloat(newRate) } : prev)
      setNewRate(''); setRateNote('')
      setRateSuccess(true)
      setTimeout(() => setRateSuccess(false), 3000)
    } catch (err) { alert(err.message) }
    finally { setRateSaving(false) }
  }

  const handleResolve = async (id) => {
    if (!resolution.trim()) return
    await resolveDispute(id, resolution)
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution } : d))
    setResolvingId(null); setResolution('')
  }

  const handleLogout = () => {
    clearTokens()
    navigate('/')
  }

  const changeTab = (id) => { setTab(id); setSidebarOpen(false) }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 68 }}>
      <span className="spinner" />
    </div>
  )

  const pendingAircraft = aircraft.filter(a => !a.is_approved)
  const openDisputes    = disputes.filter(d => d.status === 'open')

  const PAGE_TITLES = {
    overview:   { label: 'Overview',           icon: 'bi-grid-1x2' },
    approvals:  { label: 'Aircraft Approvals', icon: 'bi-check-circle' },
    disputes:   { label: 'Disputes',           icon: 'bi-flag' },
    commission: { label: 'Commission Rates',   icon: 'bi-percent' },
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

        {/* Avatar + user info */}
        <div className="mem-sidebar-header">
          <div className="mem-sidebar-avatar">
            <i className="bi bi-shield-check" />
          </div>
          <div className="mem-sidebar-role">Platform Admin</div>
          <div className="mem-sidebar-name">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
          </div>
          <div className="mem-sidebar-email">{user?.email}</div>
        </div>

        {/* Nav items */}
        <nav className="mem-nav">
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} className="mem-nav-section">{item.section}</div>
            )
            const badge = item.id === 'approvals' && pendingAircraft.length > 0 ? pendingAircraft.length
                        : item.id === 'disputes'  && openDisputes.length > 0   ? openDisputes.length
                        : null
            return (
              <button key={item.id}
                className={`mem-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => changeTab(item.id)}>
                <i className={`bi ${item.icon}`} />
                {item.label}
                {badge && (
                  <span className={`mem-nav-badge${item.id === 'disputes' ? ' red' : ''}`}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom links */}
        <div className="mem-sidebar-footer">
          <Link to="/" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Back to Site
          </Link>
          <button className="mem-nav-item" onClick={handleLogout}
            style={{ color: 'rgba(255,120,120,0.7)' }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
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
            {/* Quick stats in topbar */}
            {summary && (
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--gray-400)', borderRight: '1px solid var(--gray-100)', paddingRight: '1rem', marginRight: '0.25rem', flexWrap: 'wrap' }}>
                <span><strong style={{ color: 'var(--navy)' }}>{summary.total_members}</strong> members</span>
                <span><strong style={{ color: 'var(--navy)' }}>{summary.total_aircraft}</strong> aircraft</span>
                <span><strong style={{ color: 'var(--gold)' }}>{summary.commission_rate}%</strong> commission</span>
              </div>
            )}
            <span style={{ fontSize: '0.72rem', background: '#E05252', color: 'white', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>Admin</span>
          </div>
        </div>

        <div className="mem-content">

          {/* ── Alert banners ── */}
          {pendingAircraft.length > 0 && tab !== 'approvals' && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-hourglass-split" />
              <span><strong>{pendingAircraft.length}</strong> aircraft pending approval.</span>
              <button onClick={() => setTab('approvals')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#92400E', textDecoration: 'underline', fontSize: '0.82rem' }}>
                Review →
              </button>
            </div>
          )}
          {openDisputes.length > 0 && tab !== 'disputes' && (
            <div className="mem-alert mem-alert-danger">
              <i className="bi bi-flag-fill" />
              <span><strong>{openDisputes.length}</strong> open dispute{openDisputes.length !== 1 ? 's' : ''} need attention.</span>
              <button onClick={() => setTab('disputes')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#991B1B', textDecoration: 'underline', fontSize: '0.82rem' }}>
                View →
              </button>
            </div>
          )}

          {/* ══════════════ OVERVIEW ══════════════ */}
          {tab === 'overview' && summary && (
            <>
              {/* Stats grid */}
              <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
                <StatCard icon="bi-cash-stack"  label="Platform Revenue"  accent="mem-stat-accent-green"
                  value={`$${Number(summary.total_platform_revenue || 0).toLocaleString()}`} sub="All completed bookings" />
                <StatCard icon="bi-percent"     label="Total Commissions" accent="mem-stat-accent"
                  value={`$${Number(summary.total_commissions || 0).toLocaleString()}`} sub={`At ${summary.commission_rate}% rate`} />
                <StatCard icon="bi-people"      label="Active Members"    accent="mem-stat-accent-blue"
                  value={summary.total_members || 0} sub="Subscribed members" />
                <StatCard icon="bi-airplane"    label="Approved Aircraft" accent="mem-stat-accent-purple"
                  value={summary.total_aircraft || 0} sub="Listed & active" />
              </div>

              <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
                {/* Revenue split */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-pie-chart" /> Revenue Split</div>
                  </div>
                  <div className="mem-panel-body">
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Platform</span><span>Fleet Owners</span>
                    </div>
                    <div className="mem-revenue-bar">
                      <div className="mem-revenue-bar-platform" style={{ width: `${summary.commission_rate}%` }}>
                        <span>{summary.commission_rate}%</span>
                      </div>
                      <div className="mem-revenue-bar-owner">
                        <span>{100 - Number(summary.commission_rate)}%</span>
                      </div>
                    </div>
                    <div className="mem-legend">
                      <span><span className="mem-legend-dot" style={{ background: 'var(--navy)' }} />Platform Commission</span>
                      <span><span className="mem-legend-dot" style={{ background: 'var(--gold)' }} />Owner Earnings</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                      {[
                        ['Platform earns', `$${Number(summary.total_commissions || 0).toLocaleString()}`, 'var(--navy)'],
                        ['Owners earned', `$${Number((summary.total_platform_revenue || 0) - (summary.total_commissions || 0)).toLocaleString()}`, '#50C878'],
                      ].map(([label, val, color]) => (   // ✅ was 'colour'
                        <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{label}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Platform health */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-activity" /> Platform Health</div>
                  </div>
                  <div className="mem-panel-body">
                    {[
                      ['Active Members',       summary.total_members || 0,     'bi-people',           'var(--navy)'],
                      ['Approved Aircraft',    summary.total_aircraft || 0,    'bi-airplane',         '#6CB4E4'],
                      ['Pending Approvals',    summary.pending_approvals || 0, 'bi-hourglass-split',  '#E09F3E'],
                      ['Open Disputes',        summary.open_disputes || 0,     'bi-flag',             '#E05252'],
                      ['Commission Rate',      `${summary.commission_rate}%`,  'bi-percent',          'var(--gold)'],
                    ].map(([label, val, icon, color]) => (   // ✅ was 'colour'
                      <div key={label} className="mem-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                          <i className={`bi ${icon}`} style={{ color, fontSize: '0.9rem', width: 18, textAlign: 'center' }} />
                          {label}
                        </div>
                        <div style={{ fontWeight: 700, color, fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{val}</div>
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
                    { label: `Review ${pendingAircraft.length} Pending Aircraft`, icon: 'bi-check-circle', tab: 'approvals', badge: pendingAircraft.length },
                    { label: `Resolve ${openDisputes.length} Disputes`,           icon: 'bi-flag',         tab: 'disputes',  badge: openDisputes.length },
                    { label: 'Update Commission Rate',                             icon: 'bi-sliders',      tab: 'commission', badge: null },
                  ].map(qa => (
                    <button key={qa.tab} onClick={() => setTab(qa.tab)}
                      className="btn btn-outline-navy btn-sm"
                      style={{ gap: '0.4rem' }}>
                      <i className={`bi ${qa.icon}`} />
                      {qa.label}
                      {qa.badge > 0 && (
                        <span style={{ background: 'var(--gold)', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>{qa.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════ APPROVALS ══════════════ */}
          {tab === 'approvals' && (
            <>
              {/* Pending */}
              <div className="mem-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-hourglass-split" /> Pending Approval
                    {pendingAircraft.length > 0 && (
                      <span className="mem-badge mem-badge-orange" style={{ marginLeft: '0.5rem' }}>{pendingAircraft.length}</span>
                    )}
                  </div>
                </div>
                <div className="mem-panel-body">
                  {pendingAircraft.length === 0 ? (
                    <EmptyState icon="bi-check-circle" message="All caught up — no pending approvals." />
                  ) : pendingAircraft.map(a => (
                    <div key={a.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: 'var(--navy)' }}>{a.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.35rem' }}>
                            {a.registration_number} · {a.model} · {a.category_display}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            <span><i className="bi bi-geo-alt" style={{ color: 'var(--gold)' }} /> {a.base_location}</span>
                            <span><i className="bi bi-people" style={{ color: 'var(--gold)' }} /> {a.passenger_capacity} pax</span>
                            <span><i className="bi bi-currency-dollar" style={{ color: 'var(--gold)' }} /> ${Number(a.hourly_rate_usd).toLocaleString()}/hr</span>
                            <span><i className="bi bi-person" style={{ color: 'var(--gold)' }} /> Owner: {a.owner_name}</span>
                          </div>
                        </div>
                        <button onClick={() => handleApprove(a.id)} className="btn btn-navy btn-sm" disabled={approving === a.id}>
                          {approving === a.id
                            ? <><span className="spinner" style={{ borderTopColor: 'white', width: 14, height: 14, borderWidth: 2 }} /> Approving…</>
                            : <><i className="bi bi-check-lg" /> Approve & List</>}
                        </button>
                      </div>
                      {a.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--gray-100)', marginBottom: 0, lineHeight: 1.7 }}>
                          {a.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approved list */}
              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-check-circle" /> Approved Aircraft
                    <span className="mem-badge mem-badge-green" style={{ marginLeft: '0.5rem' }}>{aircraft.filter(a => a.is_approved).length}</span>
                  </div>
                </div>
                <div className="mem-panel-body">
                  {aircraft.filter(a => a.is_approved).length === 0 ? (
                    <EmptyState icon="bi-airplane" message="No approved aircraft yet." />
                  ) : aircraft.filter(a => a.is_approved).map(a => (
                    <div key={a.id} className="mem-row">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{a.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>{a.registration_number} · {a.owner_name}</div>
                      </div>
                      <span className="mem-badge mem-badge-green"><i className="bi bi-check" /> Approved</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════ DISPUTES ══════════════ */}
          {tab === 'disputes' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-flag" /> All Disputes
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span className="mem-badge mem-badge-red">{openDisputes.length} open</span>
                  <span className="mem-badge mem-badge-green">{disputes.filter(d => d.status === 'resolved').length} resolved</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {disputes.length === 0 ? (
                  <EmptyState icon="bi-check-circle" message="No disputes found." />
                ) : disputes.map(d => (
                  <div key={d.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>{d.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          Raised by <strong>{d.raised_by_name}</strong> · {new Date(d.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                        </div>
                      </div>
                      <span className={`mem-badge ${DISPUTE_STATUS[d.status] || 'mem-badge-gray'}`}>
                        {d.status_display || d.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.83rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '0.75rem' }}>{d.description}</p>

                    {d.resolution && (
                      <div className="mem-alert mem-alert-success" style={{ marginBottom: '0.75rem' }}>
                        <i className="bi bi-check-circle-fill" />
                        <div><strong>Resolution:</strong> {d.resolution}</div>
                      </div>
                    )}

                    {d.status === 'open' && (
                      resolvingId === d.id ? (
                        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
                          <textarea className="form-control" style={{ minHeight: 72, marginBottom: '0.65rem', fontSize: '0.83rem' }}
                            placeholder="Describe the resolution…" value={resolution}
                            onChange={e => setResolution(e.target.value)} />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setResolvingId(null); setResolution('') }}
                              className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--navy)' }}>Cancel</button>
                            <button onClick={() => handleResolve(d.id)} className="btn btn-navy btn-sm">
                              <i className="bi bi-check" /> Mark Resolved
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setResolvingId(d.id)}
                          className="btn btn-outline-navy btn-sm">
                          Resolve Dispute
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ COMMISSION ══════════════ */}
          {tab === 'commission' && (
            <>
              {/* Current rate callout */}
              <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Current Commission Rate</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
                    {summary?.commission_rate}%
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    Owners receive {100 - Number(summary?.commission_rate || 0)}% of each booking
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginBottom: '0.25rem' }}>Platform earns</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'white' }}>
                    ${Number(summary?.total_commissions || 0).toLocaleString()}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>total earned</div>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
                {/* Set rate form */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-sliders" /> Set New Rate</div>
                  </div>
                  <div className="mem-panel-body">
                    {rateSuccess && (
                      <div className="mem-alert mem-alert-success" style={{ marginBottom: '1rem' }}>
                        <i className="bi bi-check-circle-fill" /> Commission rate updated successfully.
                      </div>
                    )}
                    <p style={{ fontSize: '0.83rem', color: 'var(--gray-400)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                      Changes apply to <strong>new bookings only</strong>. Existing confirmed bookings are not affected.
                    </p>
                    <form onSubmit={handleSetRate}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">New Rate (%) <span className="req">*</span></label>
                        <input className="form-control" type="number" step="0.5" min="0" max="50"
                          required value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g. 12.5" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Reason / Notes</label>
                        <input className="form-control" value={rateNote} onChange={e => setRateNote(e.target.value)} placeholder="Optional note about this change" />
                      </div>
                      {newRate && (
                        <div className="mem-alert mem-alert-info" style={{ marginBottom: '1rem' }}>
                          <i className="bi bi-info-circle" />
                          <span>Platform: <strong>{newRate}%</strong> · Owners receive: <strong>{(100 - parseFloat(newRate || 0)).toFixed(1)}%</strong></span>
                        </div>
                      )}
                      <button type="submit" className="btn btn-navy" disabled={rateSaving} style={{ width: '100%', justifyContent: 'center' }}>
                        {rateSaving
                          ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                          : <><i className="bi bi-check" /> Apply New Rate</>}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Rate history */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-clock-history" /> Rate History</div>
                  </div>
                  <div className="mem-panel-body">
                    {commissions.length === 0 ? (
                      <EmptyState icon="bi-clock-history" message="No rate history yet." />
                    ) : commissions.map((c, i) => (
                      <div key={c.id} className="mem-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)' }}>{c.rate_pct}%</span>
                            {i === 0 && <span className="mem-badge mem-badge-green">Current</span>}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.1rem' }}>
                            Effective {c.effective_from}
                            {c.notes && ` · ${c.notes}`}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)', textAlign: 'right' }}>
                          {new Date(c.created_at).toLocaleDateString('en-GB', { dateStyle: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>{/* /mem-content */}
      </main>
    </div>
  )
}