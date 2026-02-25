// src/pages/membership/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getAdminDashboard, getMarketplaceAircraft, approveAircraft,
  getDisputes, resolveDispute, getCommissionSettings, setCommissionRate,
  clearTokens,
  // Admin CRUD
  adminGetFlightBookings, adminSetFlightPrice, adminReplyFlightBooking, adminUpdateFlightStatus, adminDeleteFlightBooking,
  adminGetYachtCharters,  adminSetYachtPrice,  adminReplyYachtCharter,
  adminGetLeaseInquiries, adminReplyLeaseInquiry, adminUpdateLeaseStatus, adminDeleteLeaseInquiry,
  adminGetContacts,       adminReplyContact,    adminDeleteContact,
  adminGetGroupCharters,  adminReplyGroupCharter, adminUpdateGroupStatus, adminDeleteGroupCharter,
  adminGetAirCargo,       adminReplyAirCargo,   adminUpdateCargoStatus,  adminDeleteAirCargo,
  adminGetAircraftSales,  adminReplyAircraftSale, adminUpdateAircraftSaleStatus, adminDeleteAircraftSale,
  adminGetMpBookings,     adminUpdateMpBookingStatus, adminSendMpConfirmation, adminDeleteMpBooking,
  adminGetUsers,          adminToggleUser,      adminEmailUser,
  calculatePrice,         sendAdminEmail,       getEmailLogs,
  adminGetInquiriesSummary,
} from '../../services/api'
import '../../styles/membership_styles.css'

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV = [
  { section: 'Dashboard' },
  { id: 'overview',      label: 'Overview',            icon: 'bi-grid-1x2' },
  { section: 'Inquiries' },
  { id: 'flight-bookings', label: 'Flight Bookings',   icon: 'bi-airplane' },
  { id: 'yacht-charters',  label: 'Yacht Charters',    icon: 'bi-water' },
  { id: 'lease',           label: 'Lease Inquiries',   icon: 'bi-file-earmark-text' },
  { id: 'contacts',        label: 'Contacts',          icon: 'bi-envelope' },
  { id: 'group-charters',  label: 'Group Charters',    icon: 'bi-people' },
  { id: 'air-cargo',       label: 'Air Cargo',         icon: 'bi-box-seam' },
  { id: 'aircraft-sales',  label: 'Aircraft Sales',    icon: 'bi-tags' },
  { section: 'Marketplace' },
  { id: 'approvals',    label: 'Aircraft Approvals',   icon: 'bi-check-circle' },
  { id: 'mp-bookings',  label: 'MP Bookings',          icon: 'bi-calendar3' },
  { id: 'disputes',     label: 'Disputes',             icon: 'bi-flag' },
  { section: 'Platform' },
  { id: 'users',        label: 'Users',                icon: 'bi-people-fill' },
  { id: 'commission',   label: 'Commission Rates',     icon: 'bi-percent' },
  { id: 'price-calc',   label: 'Price Calculator',     icon: 'bi-calculator' },
  { id: 'email-logs',   label: 'Email Logs',           icon: 'bi-send-check' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function EmptyState({ icon, message }) {
  return (
    <div className="mem-empty">
      <i className={`bi ${icon}`} /><p>{message}</p>
    </div>
  )
}

const DISPUTE_STATUS = {
  open: 'mem-badge-red', reviewing: 'mem-badge-orange',
  resolved: 'mem-badge-green', closed: 'mem-badge-gray',
}
const STATUS_BADGE = {
  inquiry: 'mem-badge-orange', quoted: 'mem-badge-blue', confirmed: 'mem-badge-green',
  in_flight: 'mem-badge-blue', completed: 'mem-badge-gray', cancelled: 'mem-badge-red',
  pending: 'mem-badge-orange', active: 'mem-badge-blue', resolved: 'mem-badge-green',
  open: 'mem-badge-red',
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="mem-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mem-modal" style={{ maxWidth: wide ? 720 : 520 }}>
        <div className="mem-modal-header">
          <div className="mem-modal-title">{title}</div>
          <button className="mem-modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose])
  const colours = { success: 'mem-alert-success', error: 'mem-alert-danger', info: 'mem-alert-info' }
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, minWidth: 280, maxWidth: 420 }}>
      <div className={`mem-alert ${colours[type]}`} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle'}`} />
        <span style={{ flex: 1 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}>×</button>
      </div>
    </div>
  )
}

// ── Reply / Email Modal ───────────────────────────────────────────────────────
function ReplyModal({ item, onClose, onSend, showPrice = false, showStatus = false, statusChoices = [] }) {
  const [subject,    setSubject]    = useState('')
  const [message,    setMessage]    = useState('')
  const [price,      setPrice]      = useState('')
  const [newStatus,  setNewStatus]  = useState('')
  const [sendEmail,  setSendEmail]  = useState(true)
  const [loading,    setLoading]    = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSend({ subject, message, new_status: newStatus, quoted_price: price || null, send_email: sendEmail }) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={<><i className="bi bi-reply" style={{ color: 'var(--gold)', marginRight: 6 }} />Reply / Email</>} onClose={onClose}>
      <form onSubmit={handle}>
        {item && (
          <div className="mem-alert mem-alert-info" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
            <i className="bi bi-person" />
            <span><strong>{item.guest_name || item.full_name || item.contact_name || item.client_name || 'Contact'}</strong>
              {' · '}{item.guest_email || item.email || item.client_email}</span>
          </div>
        )}
        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Subject <span className="req">*</span></label>
          <input className="form-control" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Your flight quote from VJetaway" />
        </div>
        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Message <span className="req">*</span></label>
          <textarea className="form-control" required style={{ minHeight: 120 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your response..." />
        </div>
        {showPrice && (
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Quoted Price (USD)</label>
            <input className="form-control" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 12500.00" />
          </div>
        )}
        {showStatus && statusChoices.length > 0 && (
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Update Status</label>
            <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">— Keep current status —</option>
              {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        <div className="form-group" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
          <label htmlFor="sendEmail" style={{ cursor: 'pointer', color: 'var(--gray-600)' }}>Send as email to contact</label>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button type="button" onClick={onClose} className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button type="submit" className="btn btn-navy btn-sm" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</> : <><i className="bi bi-send" /> Send Reply</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Set Price Modal ───────────────────────────────────────────────────────────
function SetPriceModal({ item, onClose, onSave, statusChoices }) {
  const [price,     setPrice]     = useState(item?.quoted_price_usd || '')
  const [status,    setStatus]    = useState(item?.status || '')
  const [emailMsg,  setEmailMsg]  = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading,   setLoading]   = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave({ quoted_price_usd: parseFloat(price), status, send_email: sendEmail, email_message: emailMsg }) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={<><i className="bi bi-currency-dollar" style={{ color: 'var(--gold)', marginRight: 6 }} />Set Quoted Price</>} onClose={onClose}>
      <form onSubmit={handle}>
        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Quoted Price (USD) <span className="req">*</span></label>
          <input className="form-control" type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 18500.00" />
        </div>
        {statusChoices && (
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <label className="form-label">Update Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Custom Email Message <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional — leave blank for default)</span></label>
          <textarea className="form-control" style={{ minHeight: 80 }} value={emailMsg} onChange={e => setEmailMsg(e.target.value)} placeholder="Override the default quote email..." />
        </div>
        <div className="form-group" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <input type="checkbox" id="se2" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
          <label htmlFor="se2" style={{ cursor: 'pointer', color: 'var(--gray-600)' }}>Email quote to contact</label>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button type="button" onClick={onClose} className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--navy)', flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button type="submit" className="btn btn-navy btn-sm" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : <><i className="bi bi-check" /> Save Quote</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Generic Inquiry Table ─────────────────────────────────────────────────────
function InquiryTable({ items, loading, onReply, onDelete, onSetPrice, onStatusChange,
                        renderMeta, showPrice, statusChoices, emptyIcon, emptyMsg }) {
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" /></div>
  if (!items.length) return <EmptyState icon={emptyIcon || 'bi-inbox'} message={emptyMsg || 'No records found.'} />
  return (
    <>
      {items.map(item => {
        const email = item.guest_email || item.email || item.client_email || ''
        const name  = item.guest_name  || item.full_name || item.contact_name || item.client_name || 'Contact'
        const st    = item.status || 'pending'
        const badge = STATUS_BADGE[st] || 'mem-badge-gray'
        const ref   = item.reference ? String(item.reference).slice(0, 8) : `#${item.id}`
        return (
          <div key={item.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', marginBottom: '0.15rem' }}>
                  {name} <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 400 }}>· {ref}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{email}</div>
                {renderMeta && <div style={{ marginTop: '0.3rem' }}>{renderMeta(item)}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                <span className={`mem-badge ${badge}`}>{item.status_display || st}</span>
                {item.quoted_price_usd && (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#1a8754' }}>
                    ${Number(item.quoted_price_usd).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid var(--gray-100)' }}>
              <button onClick={() => onReply(item)} className="btn btn-outline-navy btn-sm" style={{ gap: '0.3rem' }}>
                <i className="bi bi-reply" /> Reply
              </button>
              {onSetPrice && (
                <button onClick={() => onSetPrice(item)} className="btn btn-sm" style={{ background: 'var(--gold-pale)', color: '#7A5C22', gap: '0.3rem' }}>
                  <i className="bi bi-currency-dollar" /> {showPrice ? 'Set Price' : 'Quote'}
                </button>
              )}
              {onStatusChange && statusChoices && (
                <select
                  value={item.status}
                  onChange={e => onStatusChange(item.id, e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer', color: 'var(--navy)', background: 'white' }}>
                  {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
              {onDelete && (
                <button onClick={() => onDelete(item.id)} className="btn btn-sm" style={{ background: '#FEF2F2', color: '#991B1B', marginLeft: 'auto', gap: '0.3rem' }}>
                  <i className="bi bi-trash" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [tab, setTab]           = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [summary, setSummary]   = useState(null)
  const [inquirySummary, setInquirySummary] = useState(null)
  const [aircraft, setAircraft] = useState([])
  const [disputes, setDisputes] = useState([])
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  // Inquiry data
  const [flightBookings, setFlightBookings] = useState([])
  const [yachtCharters,  setYachtCharters]  = useState([])
  const [leaseInquiries, setLeaseInquiries] = useState([])
  const [contacts,       setContacts]       = useState([])
  const [groupCharters,  setGroupCharters]  = useState([])
  const [airCargo,       setAirCargo]       = useState([])
  const [aircraftSales,  setAircraftSales]  = useState([])
  const [mpBookings,     setMpBookings]     = useState([])
  const [users,          setUsers]          = useState([])
  const [emailLogs,      setEmailLogs]      = useState([])
  // Commission
  const [newRate, setNewRate]   = useState('')
  const [rateNote, setRateNote] = useState('')
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSuccess, setRateSuccess] = useState(false)
  // Disputes
  const [resolvingId, setResolvingId] = useState(null)
  const [resolution,  setResolution]  = useState('')
  // Approvals
  const [approving, setApproving] = useState(null)
  // Modals
  const [replyModal,    setReplyModal]    = useState(null)   // { item, type }
  const [priceModal,    setPriceModal]    = useState(null)   // { item, type }
  const [emailModal,    setEmailModal]    = useState(null)   // { user }
  const [calcResult,    setCalcResult]    = useState(null)
  const [calcForm,      setCalcForm]      = useState({ hourly_rate_usd:'', estimated_hours:'', passenger_count:1, catering:false, ground_transport:false, concierge:false, discount_pct:0, commission_pct:'' })
  const [calcLoading,   setCalcLoading]   = useState(false)
  // Toast
  const [toast, setToast] = useState(null)  // { message, type }

  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('vj_user') || 'null')

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/membership/login'); return }
    Promise.all([
      getAdminDashboard(),
      getMarketplaceAircraft(),
      getDisputes(),
      getCommissionSettings(),
      adminGetInquiriesSummary(),
    ]).then(([s, a, d, c, inq]) => {
      setSummary(s)
      setAircraft(Array.isArray(a) ? a : a.results || [])
      setDisputes(Array.isArray(d) ? d : d.results || [])
      setCommissions(Array.isArray(c) ? c : c.results || [])
      setInquirySummary(inq)
    }).catch(() => navigate('/membership/login'))
    .finally(() => setLoading(false))
  }, [])

  // ── Lazy-load tab data ─────────────────────────────────────────────────────
  useEffect(() => {
    const loaders = {
      'flight-bookings': () => adminGetFlightBookings().then(d => setFlightBookings(Array.isArray(d) ? d : d.results || [])),
      'yacht-charters':  () => adminGetYachtCharters().then(d  => setYachtCharters(Array.isArray(d) ? d : d.results || [])),
      'lease':           () => adminGetLeaseInquiries().then(d => setLeaseInquiries(Array.isArray(d) ? d : d.results || [])),
      'contacts':        () => adminGetContacts().then(d        => setContacts(Array.isArray(d) ? d : d.results || [])),
      'group-charters':  () => adminGetGroupCharters().then(d  => setGroupCharters(Array.isArray(d) ? d : d.results || [])),
      'air-cargo':       () => adminGetAirCargo().then(d        => setAirCargo(Array.isArray(d) ? d : d.results || [])),
      'aircraft-sales':  () => adminGetAircraftSales().then(d  => setAircraftSales(Array.isArray(d) ? d : d.results || [])),
      'mp-bookings':     () => adminGetMpBookings().then(d      => setMpBookings(Array.isArray(d) ? d : d.results || [])),
      'users':           () => adminGetUsers().then(d           => setUsers(Array.isArray(d) ? d : d.results || [])),
      'email-logs':      () => getEmailLogs().then(d            => setEmailLogs(Array.isArray(d) ? d : d.results || [])),
    }
    if (loaders[tab]) {
      setTabLoading(true)
      loaders[tab]().catch(() => {}).finally(() => setTabLoading(false))
    }
  }, [tab])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setApproving(id)
    try {
      await approveAircraft(id)
      setAircraft(prev => prev.map(a => a.id === id ? { ...a, is_approved: true, status: 'available' } : a))
      setSummary(prev => prev ? { ...prev, pending_approvals: prev.pending_approvals - 1, total_aircraft: prev.total_aircraft + 1 } : prev)
      showToast('Aircraft approved and listed.')
    } catch (e) { showToast(e.message, 'error') }
    finally { setApproving(null) }
  }

  const handleSetRate = async (e) => {
    e.preventDefault(); setRateSaving(true)
    try {
      const r = await setCommissionRate({ rate_pct: parseFloat(newRate), notes: rateNote })
      setCommissions(prev => [r, ...prev])
      setSummary(prev => prev ? { ...prev, commission_rate: parseFloat(newRate) } : prev)
      setNewRate(''); setRateNote('')
      setRateSuccess(true); setTimeout(() => setRateSuccess(false), 3000)
      showToast('Commission rate updated.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setRateSaving(false) }
  }

  const handleResolve = async (id) => {
    if (!resolution.trim()) return
    await resolveDispute(id, resolution)
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolution } : d))
    setResolvingId(null); setResolution('')
    showToast('Dispute resolved.')
  }

  const handleReply = async (data) => {
    const { item, type } = replyModal
    try {
      const fns = {
        'flight-bookings': adminReplyFlightBooking,
        'yacht-charters':  adminReplyYachtCharter,
        'lease':           adminReplyLeaseInquiry,
        'contacts':        adminReplyContact,
        'group-charters':  adminReplyGroupCharter,
        'air-cargo':       adminReplyAirCargo,
        'aircraft-sales':  adminReplyAircraftSale,
      }
      await fns[type](item.id, data)
      setReplyModal(null)
      showToast('Reply sent successfully.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleSetPrice = async (data) => {
    const { item, type } = priceModal
    try {
      const fns = { 'flight-bookings': adminSetFlightPrice, 'yacht-charters': adminSetYachtPrice }
      await fns[type](item.id, data)
      setPriceModal(null)
      showToast('Price set and email sent.')
      // Refresh
      if (type === 'flight-bookings') adminGetFlightBookings().then(d => setFlightBookings(Array.isArray(d) ? d : d.results || []))
      if (type === 'yacht-charters')  adminGetYachtCharters().then(d => setYachtCharters(Array.isArray(d) ? d : d.results || []))
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      const fns = {
        'lease':          (id, s) => adminUpdateLeaseStatus(id, s),
        'group-charters': (id, s) => adminUpdateGroupStatus(id, s),
        'air-cargo':      (id, s) => adminUpdateCargoStatus(id, s),
        'aircraft-sales': (id, s) => adminUpdateAircraftSaleStatus(id, s),
        'mp-bookings':    (id, s) => adminUpdateMpBookingStatus(id, s),
        'flight-bookings':(id, s) => adminUpdateFlightStatus(id, s),
      }
      await fns[type](id, newStatus)
      showToast('Status updated.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this record permanently?')) return
    const fns = {
      'flight-bookings': adminDeleteFlightBooking,
      'yacht-charters':  async (id) => { /* no delete endpoint exposed — show alert */ showToast('Delete not enabled for yacht charters.', 'info'); return },
      'lease':           adminDeleteLeaseInquiry,
      'contacts':        adminDeleteContact,
      'group-charters':  adminDeleteGroupCharter,
      'air-cargo':       adminDeleteAirCargo,
      'aircraft-sales':  adminDeleteAircraftSale,
      'mp-bookings':     adminDeleteMpBooking,
    }
    try {
      await fns[type](id)
      showToast('Record deleted.')
      // refresh
      const setters = {
        'flight-bookings': [adminGetFlightBookings, setFlightBookings],
        'lease':           [adminGetLeaseInquiries, setLeaseInquiries],
        'contacts':        [adminGetContacts,       setContacts],
        'group-charters':  [adminGetGroupCharters,  setGroupCharters],
        'air-cargo':       [adminGetAirCargo,        setAirCargo],
        'aircraft-sales':  [adminGetAircraftSales,   setAircraftSales],
        'mp-bookings':     [adminGetMpBookings,       setMpBookings],
      }
      if (setters[type]) {
        const [fn, setter] = setters[type]
        fn().then(d => setter(Array.isArray(d) ? d : d.results || []))
      }
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleEmailUser = async (data) => {
    const uid = emailModal.user.id
    try {
      await adminEmailUser(uid, data)
      setEmailModal(null)
      showToast('Email sent to user.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleToggleUser = async (id) => {
    try {
      const r = await adminToggleUser(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: r.is_active } : u))
      showToast(r.message)
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleCalc = async (e) => {
    e.preventDefault(); setCalcLoading(true); setCalcResult(null)
    try {
      const r = await calculatePrice({
        ...calcForm,
        estimated_hours:  parseFloat(calcForm.estimated_hours),
        passenger_count:  parseInt(calcForm.passenger_count),
        discount_pct:     parseFloat(calcForm.discount_pct || 0),
        commission_pct:   calcForm.commission_pct ? parseFloat(calcForm.commission_pct) : undefined,
        hourly_rate_usd:  calcForm.hourly_rate_usd ? parseFloat(calcForm.hourly_rate_usd) : undefined,
      })
      setCalcResult(r.breakdown)
    } catch (e) { showToast(e.message, 'error') }
    finally { setCalcLoading(false) }
  }

  const handleSendMpConfirmation = async (id) => {
    try {
      await adminSendMpConfirmation(id, {})
      showToast('Confirmation email sent to client.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const changeTab = (id) => { setTab(id); setSidebarOpen(false) }
  const handleLogout = () => { clearTokens(); navigate('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 68 }}>
      <span className="spinner" />
    </div>
  )

  const pendingAircraft = aircraft.filter(a => !a.is_approved)
  const openDisputes    = disputes.filter(d => d.status === 'open')
  const totalPending    = (inquirySummary?.pending_flight_bookings || 0)
    + (inquirySummary?.pending_yacht_charters || 0)
    + (inquirySummary?.pending_contacts || 0)
    + (inquirySummary?.pending_group_charters || 0)
    + (inquirySummary?.pending_air_cargo || 0)
    + (inquirySummary?.pending_aircraft_sales || 0)
    + (inquirySummary?.pending_lease || 0)

  const PAGE_TITLES = {
    overview:         { label: 'Overview',           icon: 'bi-grid-1x2' },
    'flight-bookings':{ label: 'Flight Bookings',    icon: 'bi-airplane' },
    'yacht-charters': { label: 'Yacht Charters',     icon: 'bi-water' },
    lease:            { label: 'Lease Inquiries',    icon: 'bi-file-earmark-text' },
    contacts:         { label: 'Contacts',           icon: 'bi-envelope' },
    'group-charters': { label: 'Group Charters',     icon: 'bi-people' },
    'air-cargo':      { label: 'Air Cargo',          icon: 'bi-box-seam' },
    'aircraft-sales': { label: 'Aircraft Sales',     icon: 'bi-tags' },
    approvals:        { label: 'Aircraft Approvals', icon: 'bi-check-circle' },
    'mp-bookings':    { label: 'Marketplace Bookings', icon: 'bi-calendar3' },
    disputes:         { label: 'Disputes',           icon: 'bi-flag' },
    users:            { label: 'Users',              icon: 'bi-people-fill' },
    commission:       { label: 'Commission Rates',   icon: 'bi-percent' },
    'price-calc':     { label: 'Price Calculator',   icon: 'bi-calculator' },
    'email-logs':     { label: 'Email Logs',         icon: 'bi-send-check' },
  }
  const currentPage = PAGE_TITLES[tab] || PAGE_TITLES.overview

  // Badge helpers for nav
  const navBadge = (id) => {
    if (id === 'approvals'        && pendingAircraft.length > 0)          return pendingAircraft.length
    if (id === 'disputes'         && openDisputes.length > 0)             return openDisputes.length
    if (id === 'flight-bookings'  && inquirySummary?.pending_flight_bookings > 0) return inquirySummary.pending_flight_bookings
    if (id === 'yacht-charters'   && inquirySummary?.pending_yacht_charters > 0)  return inquirySummary.pending_yacht_charters
    if (id === 'contacts'         && inquirySummary?.pending_contacts > 0)         return inquirySummary.pending_contacts
    if (id === 'group-charters'   && inquirySummary?.pending_group_charters > 0)   return inquirySummary.pending_group_charters
    if (id === 'air-cargo'        && inquirySummary?.pending_air_cargo > 0)        return inquirySummary.pending_air_cargo
    if (id === 'aircraft-sales'   && inquirySummary?.pending_aircraft_sales > 0)   return inquirySummary.pending_aircraft_sales
    if (id === 'lease'            && inquirySummary?.pending_lease > 0)            return inquirySummary.pending_lease
    return null
  }
  const isRedBadge = (id) => ['disputes','contacts','air-cargo'].includes(id)

  return (
    <div className="mem-shell">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modals */}
      {replyModal && (
        <ReplyModal
          item={replyModal.item}
          onClose={() => setReplyModal(null)}
          onSend={handleReply}
          showPrice={['flight-bookings','yacht-charters'].includes(replyModal.type)}
          showStatus
          statusChoices={
            replyModal.type === 'flight-bookings' ? [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']] :
            replyModal.type === 'yacht-charters'  ? [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']] :
            [['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]
          }
        />
      )}
      {priceModal && (
        <SetPriceModal
          item={priceModal.item}
          onClose={() => setPriceModal(null)}
          onSave={handleSetPrice}
          statusChoices={
            priceModal.type === 'flight-bookings'
              ? [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']]
              : [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]
          }
        />
      )}
      {emailModal && (
        <ReplyModal
          item={{ guest_name: emailModal.user.full_name, guest_email: emailModal.user.email }}
          onClose={() => setEmailModal(null)}
          onSend={handleEmailUser}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="mem-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`mem-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="mem-sidebar-header">
          <div className="mem-sidebar-avatar"><i className="bi bi-shield-check" /></div>
          <div className="mem-sidebar-role">Platform Admin</div>
          <div className="mem-sidebar-name">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
          </div>
          <div className="mem-sidebar-email">{user?.email}</div>
        </div>

        <nav className="mem-nav">
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="mem-nav-section">{item.section}</div>
            const badge = navBadge(item.id)
            return (
              <button key={item.id}
                className={`mem-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => changeTab(item.id)}>
                <i className={`bi ${item.icon}`} />
                {item.label}
                {badge != null && (
                  <span className={`mem-nav-badge${isRedBadge(item.id) ? ' red' : ''}`}>{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mem-sidebar-footer">
          <Link to="/" className="mem-nav-item" style={{ display: 'flex', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Back to Site
          </Link>
          <button className="mem-nav-item" onClick={handleLogout} style={{ color: 'rgba(255,120,120,0.7)' }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="mem-main">
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
                <span><strong style={{ color: 'var(--navy)' }}>{summary.total_members}</strong> members</span>
                <span><strong style={{ color: 'var(--navy)' }}>{summary.total_aircraft}</strong> aircraft</span>
                <span><strong style={{ color: 'var(--gold)' }}>{summary.commission_rate}%</strong> commission</span>
                {totalPending > 0 && <span><strong style={{ color: '#E05252' }}>{totalPending}</strong> pending</span>}
              </div>
            )}
            <span style={{ fontSize: '0.72rem', background: '#E05252', color: 'white', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>Admin</span>
          </div>
        </div>

        <div className="mem-content">

          {/* Alert banners */}
          {pendingAircraft.length > 0 && tab !== 'approvals' && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-hourglass-split" />
              <span><strong>{pendingAircraft.length}</strong> aircraft pending approval.</span>
              <button onClick={() => setTab('approvals')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#92400E', textDecoration: 'underline', fontSize: '0.82rem' }}>Review →</button>
            </div>
          )}
          {openDisputes.length > 0 && tab !== 'disputes' && (
            <div className="mem-alert mem-alert-danger">
              <i className="bi bi-flag-fill" />
              <span><strong>{openDisputes.length}</strong> open disputes need attention.</span>
              <button onClick={() => setTab('disputes')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#991B1B', textDecoration: 'underline', fontSize: '0.82rem' }}>View →</button>
            </div>
          )}
          {totalPending > 0 && !['flight-bookings','yacht-charters','lease','contacts','group-charters','air-cargo','aircraft-sales'].includes(tab) && (
            <div className="mem-alert mem-alert-info">
              <i className="bi bi-inbox-fill" />
              <span><strong>{totalPending}</strong> inquiries awaiting response.</span>
            </div>
          )}

          {/* ══ OVERVIEW ══ */}
          {tab === 'overview' && summary && (
            <>
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

              {/* Inquiry summary cards */}
              {inquirySummary && (
                <div className="mem-panel" style={{ marginBottom: '1.75rem' }}>
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-inbox" /> Inquiry Summary</div>
                  </div>
                  <div className="mem-panel-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}>
                      {[
                        ['Flight Bookings',  inquirySummary.flight_bookings,  inquirySummary.pending_flight_bookings, 'flight-bookings', 'bi-airplane'],
                        ['Yacht Charters',   inquirySummary.yacht_charters,   inquirySummary.pending_yacht_charters,  'yacht-charters',  'bi-water'],
                        ['Lease Inquiries',  inquirySummary.lease_inquiries,  inquirySummary.pending_lease,           'lease',           'bi-file-earmark-text'],
                        ['Contacts',         inquirySummary.contacts,         inquirySummary.pending_contacts,        'contacts',        'bi-envelope'],
                        ['Group Charters',   inquirySummary.group_charters,   inquirySummary.pending_group_charters,  'group-charters',  'bi-people'],
                        ['Air Cargo',        inquirySummary.air_cargo,        inquirySummary.pending_air_cargo,       'air-cargo',       'bi-box-seam'],
                        ['Aircraft Sales',   inquirySummary.aircraft_sales,   inquirySummary.pending_aircraft_sales,  'aircraft-sales',  'bi-tags'],
                      ].map(([label, total, pending, tabId, icon]) => (
                        <button key={tabId} onClick={() => setTab(tabId)}
                          style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-100)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                            {pending > 0 && <span className="mem-badge mem-badge-red">{pending}</span>}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '0.2rem' }}>{total}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
                {/* Revenue Split */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-pie-chart" /> Revenue Split</div>
                  </div>
                  <div className="mem-panel-body">
                    <div className="mem-revenue-bar">
                      <div className="mem-revenue-bar-platform" style={{ width: `${summary.commission_rate}%` }}>
                        <span>{summary.commission_rate}%</span>
                      </div>
                      <div className="mem-revenue-bar-owner">
                        <span>{100 - Number(summary.commission_rate)}%</span>
                      </div>
                    </div>
                    <div className="mem-legend" style={{ marginBottom: '1rem' }}>
                      <span><span className="mem-legend-dot" style={{ background: 'var(--navy)' }} />Platform</span>
                      <span><span className="mem-legend-dot" style={{ background: 'var(--gold)' }} />Owners</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        ['Platform earns', `$${Number(summary.total_commissions || 0).toLocaleString()}`, 'var(--navy)'],
                        ['Owners earned',  `$${Number((summary.total_platform_revenue || 0) - (summary.total_commissions || 0)).toLocaleString()}`, '#50C878'],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{label}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-activity" /> Platform Health</div>
                  </div>
                  <div className="mem-panel-body">
                    {[
                      ['Active Members',    summary.total_members || 0,     'bi-people',          'var(--navy)'],
                      ['Approved Aircraft', summary.total_aircraft || 0,    'bi-airplane',        '#6CB4E4'],
                      ['Pending Approvals', summary.pending_approvals || 0, 'bi-hourglass-split', '#E09F3E'],
                      ['Open Disputes',     summary.open_disputes || 0,     'bi-flag',            '#E05252'],
                      ['Commission Rate',   `${summary.commission_rate}%`,  'bi-percent',         'var(--gold)'],
                    ].map(([label, val, icon, color]) => (
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
                <div className="mem-panel-body" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {[
                    ['flight-bookings','bi-airplane','Flight Bookings'],['yacht-charters','bi-water','Yacht Charters'],
                    ['approvals','bi-check-circle','Aircraft Approvals'],['disputes','bi-flag','Disputes'],
                    ['price-calc','bi-calculator','Price Calculator'],['commission','bi-percent','Commission'],
                    ['users','bi-people-fill','Users'],
                  ].map(([tabId, icon, label]) => {
                    const badge = navBadge(tabId)
                    return (
                      <button key={tabId} onClick={() => setTab(tabId)} className="btn btn-outline-navy btn-sm" style={{ gap: '0.35rem' }}>
                        <i className={`bi ${icon}`} /> {label}
                        {badge > 0 && <span style={{ background: 'var(--gold)', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>{badge}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ══ FLIGHT BOOKINGS ══ */}
          {tab === 'flight-bookings' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-airplane" /> Flight Bookings <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{flightBookings.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={flightBookings} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'flight-bookings' })}
                  onSetPrice={item => setPriceModal({ item, type: 'flight-bookings' })}
                  onDelete={id => handleDelete(id, 'flight-bookings')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'flight-bookings')}
                  showPrice statusChoices={[['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['in_flight','In Flight'],['completed','Completed'],['cancelled','Cancelled']]}
                  emptyIcon="bi-airplane" emptyMsg="No flight booking inquiries yet."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      <i className="bi bi-geo-alt" style={{ color: 'var(--gold)' }} />{' '}
                      {item.origin_detail?.code || '—'} → {item.dest_detail?.code || '—'} ·{' '}
                      {item.departure_date} · {item.passenger_count} pax · {item.trip_type_display}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ YACHT CHARTERS ══ */}
          {tab === 'yacht-charters' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-water" /> Yacht Charters <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{yachtCharters.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={yachtCharters} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'yacht-charters' })}
                  onSetPrice={item => setPriceModal({ item, type: 'yacht-charters' })}
                  showPrice
                  statusChoices={[['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['active','Active Charter'],['completed','Completed'],['cancelled','Cancelled']]}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'yacht-charters')}
                  emptyIcon="bi-water" emptyMsg="No yacht charter inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      {item.departure_port}{item.destination_port ? ` → ${item.destination_port}` : ''} ·{' '}
                      {item.charter_start} – {item.charter_end} · {item.guest_count} guests
                      {item.yacht_name && <> · <strong>{item.yacht_name}</strong></>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ LEASE INQUIRIES ══ */}
          {tab === 'lease' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-file-earmark-text" /> Lease Inquiries <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{leaseInquiries.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={leaseInquiries} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'lease' })}
                  onDelete={id => handleDelete(id, 'lease')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'lease')}
                  statusChoices={[['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]}
                  emptyIcon="bi-file-earmark-text" emptyMsg="No lease inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      {item.asset_type_display} · {item.lease_duration_display} · Starts {item.preferred_start_date}
                      {item.budget_range && <> · Budget: {item.budget_range}</>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ CONTACTS ══ */}
          {tab === 'contacts' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-envelope" /> Contact Inquiries <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{contacts.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={contacts} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'contacts' })}
                  onDelete={id => handleDelete(id, 'contacts')}
                  emptyIcon="bi-envelope" emptyMsg="No contact inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      <span className={`mem-badge ${STATUS_BADGE[item.subject] || 'mem-badge-gray'}`} style={{ fontSize: '0.65rem' }}>{item.subject_display || item.subject}</span>
                      {item.company && <> · {item.company}</>}
                      <div style={{ marginTop: '0.25rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>{item.message?.slice(0, 80)}…</div>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ GROUP CHARTERS ══ */}
          {tab === 'group-charters' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-people" /> Group Charter Inquiries <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{groupCharters.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={groupCharters} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'group-charters' })}
                  onDelete={id => handleDelete(id, 'group-charters')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'group-charters')}
                  statusChoices={[['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]}
                  emptyIcon="bi-people" emptyMsg="No group charter inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      {item.group_type_display} · {item.group_size} pax ·{' '}
                      {item.origin_description} → {item.destination_description}
                      {item.departure_date && <> · {item.departure_date}</>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ AIR CARGO ══ */}
          {tab === 'air-cargo' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-box-seam" /> Air Cargo Inquiries <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{airCargo.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={airCargo} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'air-cargo' })}
                  onDelete={id => handleDelete(id, 'air-cargo')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'air-cargo')}
                  statusChoices={[['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]}
                  emptyIcon="bi-box-seam" emptyMsg="No air cargo inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      {item.cargo_type_display} · {item.urgency_display} ·{' '}
                      {item.origin_description} → {item.destination_description}
                      {item.weight_kg && <> · {item.weight_kg}kg</>}
                      {item.is_hazardous && <span className="mem-badge mem-badge-red" style={{ fontSize: '0.62rem', marginLeft: 6 }}>Hazardous</span>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ AIRCRAFT SALES ══ */}
          {tab === 'aircraft-sales' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-tags" /> Aircraft Sales Inquiries <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{aircraftSales.length}</span></div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable
                  items={aircraftSales} loading={tabLoading}
                  onReply={item => setReplyModal({ item, type: 'aircraft-sales' })}
                  onDelete={id => handleDelete(id, 'aircraft-sales')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'aircraft-sales')}
                  statusChoices={[['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]}
                  emptyIcon="bi-tags" emptyMsg="No aircraft sales inquiries."
                  renderMeta={item => (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                      {item.inquiry_type_display}
                      {item.preferred_category && <> · {item.preferred_category}</>}
                      {item.budget_range_display && <> · {item.budget_range_display}</>}
                      {item.aircraft_make && <> · {item.aircraft_make} {item.aircraft_model}</>}
                      {item.year_of_manufacture && <> ({item.year_of_manufacture})</>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ AIRCRAFT APPROVALS ══ */}
          {tab === 'approvals' && (
            <>
              <div className="mem-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-hourglass-split" /> Pending Approval
                    {pendingAircraft.length > 0 && <span className="mem-badge mem-badge-orange" style={{ marginLeft: 6 }}>{pendingAircraft.length}</span>}
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
                            <span><i className="bi bi-person" style={{ color: 'var(--gold)' }} /> {a.owner_name}</span>
                          </div>
                        </div>
                        <button onClick={() => handleApprove(a.id)} className="btn btn-navy btn-sm" disabled={approving === a.id}>
                          {approving === a.id ? <><span className="spinner" style={{ borderTopColor: 'white', width: 14, height: 14, borderWidth: 2 }} /> Approving…</> : <><i className="bi bi-check-lg" /> Approve & List</>}
                        </button>
                      </div>
                      {a.description && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--gray-100)', marginBottom: 0 }}>{a.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title"><i className="bi bi-check-circle" /> Approved Aircraft <span className="mem-badge mem-badge-green" style={{ marginLeft: 6 }}>{aircraft.filter(a => a.is_approved).length}</span></div>
                </div>
                <div className="mem-panel-body">
                  {aircraft.filter(a => a.is_approved).map(a => (
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

          {/* ══ MARKETPLACE BOOKINGS ══ */}
          {tab === 'mp-bookings' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-calendar3" /> Marketplace Bookings <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{mpBookings.length}</span></div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
                  : mpBookings.length === 0 ? <EmptyState icon="bi-calendar3" message="No marketplace bookings." />
                  : mpBookings.map(b => (
                  <div key={b.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)' }}>
                          {b.origin} → {b.destination}
                          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 400, marginLeft: 8 }}>
                            {String(b.reference).slice(0,8)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.77rem', color: 'var(--gray-400)', marginTop: '0.15rem' }}>
                          <i className="bi bi-person" style={{ color: 'var(--gold)' }} /> {b.client_name} · {b.client_email} ·{' '}
                          <i className="bi bi-airplane" style={{ color: 'var(--gold)' }} /> {b.aircraft_name}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.1rem' }}>
                          {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {b.passenger_count} pax
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`mem-badge ${STATUS_BADGE[b.status] || 'mem-badge-gray'}`}>{b.status_display || b.status}</span>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)', marginTop: '0.3rem' }}>
                          ${Number(b.gross_amount_usd).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                          Commission: ${Number(b.commission_usd).toLocaleString()} · Owner: ${Number(b.net_owner_usd).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.6rem', borderTop: '1px solid var(--gray-100)' }}>
                      <button onClick={() => handleSendMpConfirmation(b.id)} className="btn btn-outline-navy btn-sm" style={{ gap: '0.3rem' }}>
                        <i className="bi bi-send" /> Send Confirmation
                      </button>
                      <select
                        value={b.status}
                        onChange={e => handleStatusChange(b.id, e.target.value, 'mp-bookings')}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer', color: 'var(--navy)', background: 'white' }}>
                        {[['pending','Pending'],['confirmed','Confirmed'],['in_flight','In Flight'],['completed','Completed'],['cancelled','Cancelled'],['disputed','Disputed']].map(([v, l]) =>
                          <option key={v} value={v}>{l}</option>
                        )}
                      </select>
                      <button onClick={() => handleDelete(b.id, 'mp-bookings')} className="btn btn-sm" style={{ background: '#FEF2F2', color: '#991B1B', marginLeft: 'auto', gap: '0.3rem' }}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ DISPUTES ══ */}
          {tab === 'disputes' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-flag" /> All Disputes</div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span className="mem-badge mem-badge-red">{openDisputes.length} open</span>
                  <span className="mem-badge mem-badge-green">{disputes.filter(d => d.status === 'resolved').length} resolved</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {disputes.length === 0 ? <EmptyState icon="bi-check-circle" message="No disputes found." />
                : disputes.map(d => (
                  <div key={d.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>{d.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          Raised by <strong>{d.raised_by_name}</strong> · {new Date(d.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                        </div>
                      </div>
                      <span className={`mem-badge ${DISPUTE_STATUS[d.status] || 'mem-badge-gray'}`}>{d.status_display || d.status}</span>
                    </div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '0.75rem' }}>{d.description}</p>
                    {d.resolution && (
                      <div className="mem-alert mem-alert-success" style={{ marginBottom: '0.75rem' }}>
                        <i className="bi bi-check-circle-fill" /><div><strong>Resolution:</strong> {d.resolution}</div>
                      </div>
                    )}
                    {d.status === 'open' && (
                      resolvingId === d.id ? (
                        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.85rem' }}>
                          <textarea className="form-control" style={{ minHeight: 72, marginBottom: '0.65rem', fontSize: '0.83rem' }}
                            placeholder="Describe the resolution…" value={resolution} onChange={e => setResolution(e.target.value)} />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setResolvingId(null); setResolution('') }} className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--navy)' }}>Cancel</button>
                            <button onClick={() => handleResolve(d.id)} className="btn btn-navy btn-sm"><i className="bi bi-check" /> Mark Resolved</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setResolvingId(d.id)} className="btn btn-outline-navy btn-sm">Resolve Dispute</button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {tab === 'users' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-people-fill" /> Users <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{users.length}</span></div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
                  : users.length === 0 ? <EmptyState icon="bi-people" message="No users found." />
                  : users.map(u => (
                  <div key={u.id} className="mem-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="bi bi-person" style={{ color: 'var(--gold)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{u.full_name || u.username}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--gray-400)' }}>{u.email} {u.company && `· ${u.company}`}</div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <span className={`mem-badge ${u.role === 'admin' ? 'mem-badge-red' : u.role === 'owner' ? 'mem-badge-blue' : 'mem-badge-navy'}`} style={{ fontSize: '0.62rem' }}>{u.role}</span>
                          {u.membership_tier && <span className="mem-badge mem-badge-gold" style={{ fontSize: '0.62rem' }}>{u.membership_tier}</span>}
                          {!u.is_active && <span className="mem-badge mem-badge-gray" style={{ fontSize: '0.62rem' }}>Inactive</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button onClick={() => setEmailModal({ user: u })} className="btn btn-outline-navy btn-sm" style={{ gap: '0.3rem' }}>
                        <i className="bi bi-envelope" /> Email
                      </button>
                      <button onClick={() => handleToggleUser(u.id)}
                        className="btn btn-sm"
                        style={{ background: u.is_active ? '#FEF2F2' : '#EBF7F1', color: u.is_active ? '#991B1B' : '#1a8754', gap: '0.3rem' }}>
                        <i className={`bi ${u.is_active ? 'bi-slash-circle' : 'bi-check-circle'}`} />
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ COMMISSION ══ */}
          {tab === 'commission' && (
            <>
              <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Current Commission Rate</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>{summary?.commission_rate}%</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.35rem' }}>Owners receive {100 - Number(summary?.commission_rate || 0)}% per booking</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginBottom: '0.25rem' }}>Platform total earned</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'white' }}>
                    ${Number(summary?.total_commissions || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="mem-panel">
                  <div className="mem-panel-header"><div className="mem-panel-title"><i className="bi bi-sliders" /> Set New Rate</div></div>
                  <div className="mem-panel-body">
                    {rateSuccess && <div className="mem-alert mem-alert-success" style={{ marginBottom: '1rem' }}><i className="bi bi-check-circle-fill" /> Rate updated successfully.</div>}
                    <form onSubmit={handleSetRate}>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">New Rate (%) <span className="req">*</span></label>
                        <input className="form-control" type="number" step="0.5" min="0" max="50" required value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g. 12.5" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Reason / Notes</label>
                        <input className="form-control" value={rateNote} onChange={e => setRateNote(e.target.value)} placeholder="Optional note" />
                      </div>
                      {newRate && (
                        <div className="mem-alert mem-alert-info" style={{ marginBottom: '1rem' }}>
                          <i className="bi bi-info-circle" />
                          <span>Platform: <strong>{newRate}%</strong> · Owners: <strong>{(100 - parseFloat(newRate || 0)).toFixed(1)}%</strong></span>
                        </div>
                      )}
                      <button type="submit" className="btn btn-navy" disabled={rateSaving} style={{ width: '100%', justifyContent: 'center' }}>
                        {rateSaving ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : <><i className="bi bi-check" /> Apply New Rate</>}
                      </button>
                    </form>
                  </div>
                </div>
                <div className="mem-panel">
                  <div className="mem-panel-header"><div className="mem-panel-title"><i className="bi bi-clock-history" /> Rate History</div></div>
                  <div className="mem-panel-body">
                    {commissions.length === 0 ? <EmptyState icon="bi-clock-history" message="No rate history yet." />
                    : commissions.map((c, i) => (
                      <div key={c.id} className="mem-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)' }}>{c.rate_pct}%</span>
                            {i === 0 && <span className="mem-badge mem-badge-green">Current</span>}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.1rem' }}>
                            Effective {c.effective_from}{c.notes && ` · ${c.notes}`}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-300)' }}>
                          {new Date(c.created_at).toLocaleDateString('en-GB', { dateStyle: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ PRICE CALCULATOR ══ */}
          {tab === 'price-calc' && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="mem-panel">
                <div className="mem-panel-header"><div className="mem-panel-title"><i className="bi bi-calculator" /> Price Calculator</div></div>
                <div className="mem-panel-body">
                  <form onSubmit={handleCalc}>
                    <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                      <label className="form-label">Hourly Rate (USD) <span className="req">*</span></label>
                      <input className="form-control" type="number" step="0.01" required value={calcForm.hourly_rate_usd} onChange={e => setCalcForm(f => ({ ...f, hourly_rate_usd: e.target.value }))} placeholder="e.g. 4500" />
                    </div>
                    <div className="grid-2" style={{ gap: '0.65rem', marginBottom: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label">Est. Hours <span className="req">*</span></label>
                        <input className="form-control" type="number" step="0.5" required value={calcForm.estimated_hours} onChange={e => setCalcForm(f => ({ ...f, estimated_hours: e.target.value }))} placeholder="e.g. 3.5" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Passengers</label>
                        <input className="form-control" type="number" min="1" value={calcForm.passenger_count} onChange={e => setCalcForm(f => ({ ...f, passenger_count: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '0.65rem', marginBottom: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label">Discount (%)</label>
                        <input className="form-control" type="number" step="0.5" min="0" max="100" value={calcForm.discount_pct} onChange={e => setCalcForm(f => ({ ...f, discount_pct: e.target.value }))} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Override Commission (%)</label>
                        <input className="form-control" type="number" step="0.5" value={calcForm.commission_pct} onChange={e => setCalcForm(f => ({ ...f, commission_pct: e.target.value }))} placeholder={`Default: ${summary?.commission_rate}%`} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      {[['catering','Catering (+$500/pax)'],['ground_transport','Ground Transport (+$800)'],['concierge','Concierge (+$400)']].map(([key, label]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--gray-600)' }}>
                          <input type="checkbox" checked={calcForm[key]} onChange={e => setCalcForm(f => ({ ...f, [key]: e.target.checked }))} />
                          {label}
                        </label>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-navy" disabled={calcLoading} style={{ width: '100%', justifyContent: 'center' }}>
                      {calcLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Calculating…</> : <><i className="bi bi-calculator" /> Calculate Price</>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Result panel */}
              <div className="mem-panel">
                <div className="mem-panel-header"><div className="mem-panel-title"><i className="bi bi-receipt" /> Price Breakdown</div></div>
                <div className="mem-panel-body">
                  {!calcResult ? (
                    <EmptyState icon="bi-calculator" message="Enter flight details and click Calculate." />
                  ) : (
                    <>
                      {[
                        ['Base Flight Cost',      `$${Number(calcResult.base_flight_cost).toLocaleString(undefined,{minimumFractionDigits:2})}`, false],
                        ['Catering',              `$${Number(calcResult.catering_cost).toLocaleString()}`, false],
                        ['Ground Transport',       `$${Number(calcResult.ground_transport).toLocaleString()}`, false],
                        ['Concierge',             `$${Number(calcResult.concierge_cost).toLocaleString()}`, false],
                        ['Subtotal',              `$${Number(calcResult.subtotal).toLocaleString(undefined,{minimumFractionDigits:2})}`, true],
                        [`Discount (${calcResult.discount_pct}%)`, `-$${Number(calcResult.discount_amount).toLocaleString(undefined,{minimumFractionDigits:2})}`, false],
                        [`Commission (${calcResult.commission_pct}%)`,`-$${Number(calcResult.commission_amount).toLocaleString(undefined,{minimumFractionDigits:2})}`, false],
                        ['Owner Net',             `$${Number(calcResult.owner_net_usd).toLocaleString(undefined,{minimumFractionDigits:2})}`, false],
                      ].map(([label, val, strong]) => (
                        <div key={label} className="mem-row">
                          <span style={{ fontSize: '0.85rem', color: strong ? 'var(--navy)' : 'var(--gray-500)', fontWeight: strong ? 700 : 400 }}>{label}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: strong ? '1rem' : '0.9rem', fontWeight: strong ? 800 : 600, color: strong ? 'var(--navy)' : 'var(--gray-600)' }}>{val}</span>
                        </div>
                      ))}
                      <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grand Total</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>
                          ${Number(calcResult.grand_total_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ EMAIL LOGS ══ */}
          {tab === 'email-logs' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-send-check" /> Email Logs <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{emailLogs.length}</span></div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
                  : emailLogs.length === 0 ? <EmptyState icon="bi-send" message="No emails sent yet." />
                  : emailLogs.map(log => (
                  <div key={log.id} className="mem-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)', marginBottom: '0.1rem' }}>{log.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        To: <strong>{log.to_name || log.to_email}</strong> ({log.to_email}) ·{' '}
                        {log.inquiry_type} ·{' '}
                        {new Date(log.sent_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      {log.error_msg && <div style={{ fontSize: '0.72rem', color: '#991B1B', marginTop: '0.15rem' }}>Error: {log.error_msg}</div>}
                    </div>
                    <span className={`mem-badge ${log.success ? 'mem-badge-green' : 'mem-badge-red'}`}>
                      {log.success ? 'Sent' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}