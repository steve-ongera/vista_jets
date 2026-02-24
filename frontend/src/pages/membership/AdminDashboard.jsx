// src/pages/membership/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminDashboard,
  getMarketplaceAircraft,
  approveAircraft,
  getDisputes,
  resolveDispute,
  getCommissionSettings,
  setCommissionRate,
} from '../../services/api'

function StatCard({ icon, label, value, sub, colour, accent }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', borderLeft: accent ? `4px solid ${accent}` : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div style={{ width: 40, height: 40, background: accent ? `${accent}22` : 'var(--gold-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ color: accent || 'var(--gold)', fontSize: '1rem' }} />
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: colour || 'var(--navy)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary]     = useState(null)
  const [aircraft, setAircraft]   = useState([])
  const [disputes, setDisputes]   = useState([])
  const [commissions, setCommissions] = useState([])
  const [tab, setTab]             = useState('overview')
  const [loading, setLoading]     = useState(true)
  const [newRate, setNewRate]     = useState('')
  const [rateNote, setRateNote]   = useState('')
  const [rateSaving, setRateSaving] = useState(false)
  const [resolvingId, setResolvingId] = useState(null)
  const [resolution, setResolution]  = useState('')
  const navigate                  = useNavigate()

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
    await approveAircraft(id)
    setAircraft(prev => prev.map(a => a.id === id ? { ...a, is_approved: true, status: 'available' } : a))
    setSummary(prev => prev ? { ...prev, pending_approvals: prev.pending_approvals - 1, total_aircraft: prev.total_aircraft + 1 } : prev)
  }

  const handleSetRate = async (e) => {
    e.preventDefault()
    setRateSaving(true)
    try {
      const r = await setCommissionRate({ rate_pct: parseFloat(newRate), notes: rateNote })
      setCommissions(prev => [r, ...prev])
      setSummary(prev => prev ? { ...prev, commission_rate: parseFloat(newRate) } : prev)
      setNewRate(''); setRateNote('')
    } catch (err) {
      alert(err.message)
    } finally {
      setRateSaving(false)
    }
  }

  const handleResolve = async (id) => {
    if (!resolution.trim()) return
    await resolveDispute(id, resolution)
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution } : d))
    setResolvingId(null); setResolution('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" />
    </div>
  )

  const pendingAircraft = aircraft.filter(a => !a.is_approved)
  const openDisputes    = disputes.filter(d => d.status === 'open')

  const TABS = [
    { id: 'overview',   label: 'Overview',          icon: 'bi-grid' },
    { id: 'approvals',  label: `Approvals (${pendingAircraft.length})`, icon: 'bi-check-circle' },
    { id: 'disputes',   label: `Disputes (${openDisputes.length})`,    icon: 'bi-flag' },
    { id: 'commission', label: 'Commission',         icon: 'bi-percent' },
  ]

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ background: 'var(--navy)', padding: '2rem 0 0' }}>
        <div className="container">
          <div style={{ paddingBottom: '1.5rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Platform Admin</div>
            <h2 style={{ color: 'white', margin: 0 }}>Admin Dashboard</h2>
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

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && summary && (
          <>
            {/* Alert banners */}
            {(pendingAircraft.length > 0 || openDisputes.length > 0) && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {pendingAircraft.length > 0 && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '0.75rem 1.1rem', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 200 }}>
                    <i className="bi bi-hourglass-split" style={{ color: '#92400E' }} />
                    <span style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: 500 }}><strong>{pendingAircraft.length}</strong> aircraft pending approval</span>
                    <button onClick={() => setTab('approvals')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'underline' }}>Review →</button>
                  </div>
                )}
                {openDisputes.length > 0 && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1.1rem', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 200 }}>
                    <i className="bi bi-flag-fill" style={{ color: '#991B1B' }} />
                    <span style={{ color: '#991B1B', fontSize: '0.875rem', fontWeight: 500 }}><strong>{openDisputes.length}</strong> open disputes</span>
                    <button onClick={() => setTab('disputes')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'underline' }}>View →</button>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard icon="bi-cash-stack"  label="Platform Revenue"    value={`$${Number(summary.total_platform_revenue || 0).toLocaleString()}`} accent="#1a8754" colour="#1a8754" />
              <StatCard icon="bi-percent"     label="Total Commissions"   value={`$${Number(summary.total_commissions || 0).toLocaleString()}`}      accent="#C9A84C" />
              <StatCard icon="bi-people"      label="Active Members"      value={summary.total_members || 0}                                          accent="#6CB4E4" />
              <StatCard icon="bi-airplane"    label="Approved Aircraft"   value={summary.total_aircraft || 0}                                         accent="#9B59B6" />
            </div>

            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard icon="bi-hourglass"   label="Pending Approvals"   value={summary.pending_approvals || 0}  accent="#E09F3E" />
              <StatCard icon="bi-flag"        label="Open Disputes"       value={summary.open_disputes || 0}      accent="#E05252" />
              <StatCard icon="bi-sliders"     label="Commission Rate"     value={`${summary.commission_rate}%`}   sub="Current platform rate" />
              <StatCard icon="bi-graph-up"    label="Net to Owners"       value={`${100 - Number(summary.commission_rate)}%`} sub="Of each booking" />
            </div>

            {/* Revenue split visual */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem' }}>Revenue Split Overview</h3>
              <div style={{ display: 'flex', gap: '0', borderRadius: 8, overflow: 'hidden', height: 32, marginBottom: '0.75rem' }}>
                <div style={{ width: `${summary.commission_rate}%`, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>{summary.commission_rate}%</span>
                </div>
                <div style={{ flex: 1, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>{100 - Number(summary.commission_rate)}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, background: 'var(--navy)', borderRadius: 2, display: 'inline-block' }} />
                  Platform Commission ({summary.commission_rate}%)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, background: 'var(--gold)', borderRadius: 2, display: 'inline-block' }} />
                  Fleet Owner Earnings ({100 - Number(summary.commission_rate)}%)
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── APPROVALS TAB ── */}
        {tab === 'approvals' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem' }}>Aircraft Pending Approval ({pendingAircraft.length})</h3>
            {pendingAircraft.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-check-circle" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: '#1a8754' }} />
                All caught up — no pending approvals.
              </div>
            ) : pendingAircraft.map(a => (
              <div key={a.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{a.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                      {a.registration_number} · {a.model} · {a.category_display}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                      Base: {a.base_location} · Capacity: {a.passenger_capacity} pax · ${Number(a.hourly_rate_usd).toLocaleString()}/hr
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-300)' }}>Owner: {a.owner_name}</div>
                  </div>
                  <button
                    onClick={() => handleApprove(a.id)}
                    className="btn btn-navy"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <i className="bi bi-check-lg" /> Approve & List
                  </button>
                </div>
                {a.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.75rem', marginBottom: 0, lineHeight: 1.6, paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                    {a.description}
                  </p>
                )}
              </div>
            ))}

            {/* Approved aircraft */}
            {aircraft.filter(a => a.is_approved).length > 0 && (
              <>
                <h4 style={{ margin: '2rem 0 1rem', color: 'var(--gray-400)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Approved Aircraft ({aircraft.filter(a => a.is_approved).length})
                </h4>
                {aircraft.filter(a => a.is_approved).map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.name}</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>{a.registration_number} · {a.owner_name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#EBF7F1', color: '#1a8754', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>● Approved</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── DISPUTES TAB ── */}
        {tab === 'disputes' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem' }}>Disputes ({disputes.length})</h3>
            {disputes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-check-circle" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: '#1a8754' }} />
                No disputes found.
              </div>
            ) : disputes.map(d => (
              <div key={d.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{d.subject}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>
                      Raised by {d.raised_by_name} · {new Date(d.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: d.status === 'resolved' ? '#EBF7F1' : '#FEF2F2', color: d.status === 'resolved' ? '#1a8754' : '#991B1B', padding: '2px 10px', borderRadius: 10, fontWeight: 700 }}>
                    {d.status_display || d.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: '0.75rem', lineHeight: 1.6 }}>{d.description}</p>

                {d.status === 'open' && (
                  resolvingId === d.id ? (
                    <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem' }}>
                      <textarea
                        className="form-control"
                        style={{ minHeight: 70, marginBottom: '0.6rem', fontSize: '0.82rem' }}
                        placeholder="Enter resolution details…"
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setResolvingId(null); setResolution('') }} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 6, padding: '0.35rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy)' }}>Cancel</button>
                        <button onClick={() => handleResolve(d.id)} className="btn btn-navy" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
                          <i className="bi bi-check" /> Mark Resolved
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setResolvingId(d.id)} style={{ background: 'none', border: '1px solid var(--navy)', borderRadius: 6, padding: '0.3rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy)' }}>
                      Resolve Dispute
                    </button>
                  )
                )}
                {d.resolution && (
                  <div style={{ background: '#EBF7F1', borderRadius: 6, padding: '0.6rem 0.85rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#1a8754' }}>
                    <strong>Resolution:</strong> {d.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── COMMISSION TAB ── */}
        {tab === 'commission' && (
          <div>
            {/* Set new rate */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>Set Commission Rate</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Current rate: <strong style={{ color: 'var(--navy)' }}>{summary?.commission_rate}%</strong>. Changes apply to new bookings only.
              </p>
              <form onSubmit={handleSetRate}>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">New Rate (%) <span className="req">*</span></label>
                    <input className="form-control" type="number" step="0.5" min="0" max="50" required value={newRate}
                      onChange={e => setNewRate(e.target.value)} placeholder="e.g. 12.5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input className="form-control" value={rateNote} onChange={e => setRateNote(e.target.value)} placeholder="Reason for change" />
                  </div>
                </div>
                <button type="submit" className="btn btn-navy" disabled={rateSaving}>
                  {rateSaving ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : <><i className="bi bi-check" /> Apply New Rate</>}
                </button>
              </form>
            </div>

            {/* Rate history */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem' }}>Rate History</h3>
              {commissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No history yet.</div>
              ) : commissions.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>{c.rate_pct}% commission</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      Effective {c.effective_from}
                      {c.notes && ` · ${c.notes}`}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'var(--blue-soft)', color: 'var(--navy)', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>
                    {new Date(c.created_at).toLocaleDateString('en-GB', { dateStyle: 'short' })}
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
