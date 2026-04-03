// src/pages/membership/AdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getAdminDashboard, getMarketplaceAircraft, approveAircraft,
  getDisputes, resolveDispute, getCommissionSettings, setCommissionRate,
  clearTokens,
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
  searchAirports,
  getAircraft,
  adminGetRevenueChart,
  adminGetCombinedRevenue,
} from '../../services/api'
import '../../styles/membership_styles.css'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

/* ── Nav config ────────────────────────────────────────────────────────────── */
const NAV = [
  { section: 'Dashboard' },
  { id: 'overview',        label: 'Overview',          icon: 'bi-grid-1x2' },
  { section: 'Inquiries' },
  { id: 'flight-bookings', label: 'Flight Bookings',   icon: 'bi-airplane' },
  { id: 'yacht-charters',  label: 'Yacht Charters',    icon: 'bi-water' },
  { id: 'lease',           label: 'Lease Inquiries',   icon: 'bi-file-earmark-text' },
  { id: 'contacts',        label: 'Contacts',          icon: 'bi-envelope' },
  { id: 'group-charters',  label: 'Group Charters',    icon: 'bi-people' },
  { id: 'air-cargo',       label: 'Air Cargo',         icon: 'bi-box-seam' },
  { id: 'aircraft-sales',  label: 'Aircraft Sales',    icon: 'bi-tags' },
  { section: 'Marketplace' },
  { id: 'approvals',       label: 'Aircraft Approvals',icon: 'bi-check-circle' },
  { id: 'mp-bookings',     label: 'MP Bookings',       icon: 'bi-calendar3' },
  { id: 'disputes',        label: 'Disputes',          icon: 'bi-flag' },
  { section: 'Platform' },
  { id: 'users',           label: 'Users',             icon: 'bi-people-fill' },
  { id: 'commission',      label: 'Commission',        icon: 'bi-percent' },
  { id: 'price-calc',      label: 'Price Calculator',  icon: 'bi-calculator' },
  { id: 'email-logs',      label: 'Email Logs',        icon: 'bi-send-check' },
]

const PAGE_TITLES = {
  overview:         { label: 'Overview',             icon: 'bi-grid-1x2' },
  'flight-bookings':{ label: 'Flight Bookings',      icon: 'bi-airplane' },
  'yacht-charters': { label: 'Yacht Charters',       icon: 'bi-water' },
  lease:            { label: 'Lease Inquiries',      icon: 'bi-file-earmark-text' },
  contacts:         { label: 'Contacts',             icon: 'bi-envelope' },
  'group-charters': { label: 'Group Charters',       icon: 'bi-people' },
  'air-cargo':      { label: 'Air Cargo',            icon: 'bi-box-seam' },
  'aircraft-sales': { label: 'Aircraft Sales',       icon: 'bi-tags' },
  approvals:        { label: 'Aircraft Approvals',   icon: 'bi-check-circle' },
  'mp-bookings':    { label: 'Marketplace Bookings', icon: 'bi-calendar3' },
  disputes:         { label: 'Disputes',             icon: 'bi-flag' },
  users:            { label: 'Users',                icon: 'bi-people-fill' },
  commission:       { label: 'Commission Rates',     icon: 'bi-percent' },
  'price-calc':     { label: 'Price Calculator',     icon: 'bi-calculator' },
  'email-logs':     { label: 'Email Logs',           icon: 'bi-send-check' },
}

const STATUS_BADGE = {
  inquiry:   'mem-badge-orange', quoted:    'mem-badge-blue',
  confirmed: 'mem-badge-green',  in_flight: 'mem-badge-blue',
  completed: 'mem-badge-gray',   cancelled: 'mem-badge-red',
  pending:   'mem-badge-orange', active:    'mem-badge-blue',
  resolved:  'mem-badge-green',  open:      'mem-badge-red',
  disputed:  'mem-badge-red',
}

const DISPUTE_BADGE = {
  open: 'mem-badge-red', reviewing: 'mem-badge-orange',
  resolved: 'mem-badge-green', closed: 'mem-badge-gray',
}

/* ── Small reusable components ─────────────────────────────────────────────── */
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

function EmptyState({ icon = 'bi-inbox', message = 'No records found.' }) {
  return (
    <div className="mem-empty">
      <i className={`bi ${icon}`} />
      <p>{message}</p>
    </div>
  )
}

function Spinner() {
  return <span className="spinner" />
}

function TabLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <Spinner />
    </div>
  )
}

/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const cls = { success: 'mem-alert-success', error: 'mem-alert-danger', info: 'mem-alert-info' }
  const ico  = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle' }

  return (
    <div className="mem-toast-wrapper">
      <div className={`mem-alert ${cls[type]}`} style={{ boxShadow: 'var(--shadow-lg)', marginBottom: 0 }}>
        <i className={`bi ${ico[type]}`} />
        <span style={{ flex: 1, fontSize: 13 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5, lineHeight: 1 }}>×</button>
      </div>
    </div>
  )
}

/* ── Modal wrapper ────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="mem-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mem-modal" style={{ maxWidth: wide ? 740 : 500 }}>
        <div className="mem-modal-header">
          <div className="mem-modal-title">{title}</div>
          <button className="mem-modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Detail modal ─────────────────────────────────────────────────────────── */
const FIELD_LABELS = {
  reference:'Reference', created_at:'Received', updated_at:'Updated',
  status_display:'Status', guest_name:'Name', guest_email:'Email',
  guest_phone:'Phone', full_name:'Name', email:'Email', phone:'Phone',
  contact_name:'Name', company:'Company', trip_type_display:'Trip Type',
  departure_date:'Departure Date', departure_time:'Departure Time',
  return_date:'Return Date', passenger_count:'Passengers',
  special_requests:'Special Requests', catering_requested:'Catering',
  ground_transport_requested:'Ground Transport', concierge_requested:'Concierge',
  quoted_price_usd:'Quoted Price (USD)', 'origin_detail.code':'Origin',
  'dest_detail.code':'Destination', departure_port:'Departure Port',
  destination_port:'Destination Port', charter_start:'Charter Start',
  charter_end:'Charter End', guest_count:'Guests',
  itinerary_description:'Itinerary', yacht_name:'Yacht',
  asset_type_display:'Asset Type', lease_duration_display:'Lease Duration',
  preferred_start_date:'Preferred Start', budget_range:'Budget Range',
  usage_description:'Usage Description', additional_notes:'Notes',
  subject_display:'Subject', message:'Message',
  group_type_display:'Group Type', group_size:'Group Size',
  origin_description:'Origin', destination_description:'Destination',
  is_round_trip:'Round Trip', catering_required:'Catering',
  ground_transport_required:'Ground Transport',
  cargo_type_display:'Cargo Type', cargo_description:'Description',
  weight_kg:'Weight (kg)', volume_m3:'Volume (m³)', dimensions:'Dimensions',
  urgency_display:'Urgency', is_hazardous:'Hazardous',
  requires_temperature_control:'Temp Control', insurance_required:'Insurance',
  customs_assistance_needed:'Customs Help', pickup_date:'Pickup Date',
  inquiry_type_display:'Inquiry Type', preferred_category:'Preferred Category',
  preferred_make_model:'Make / Model', budget_range_display:'Budget',
  aircraft_make:'Aircraft Make', aircraft_model:'Aircraft Model',
  year_of_manufacture:'Year', serial_number:'Serial No.',
  total_flight_hours:'Total Hours', asking_price_usd:'Asking Price (USD)',
  origin:'Origin', destination:'Destination',
  departure_datetime:'Departure', return_datetime:'Return',
  estimated_hours:'Est. Hours', aircraft_name:'Aircraft',
  gross_amount_usd:'Gross Amount', commission_usd:'Commission',
  net_owner_usd:'Owner Net', client_name:'Client', client_email:'Client Email',
}

const SKIP_KEYS = new Set([
  'id','legs','origin_detail','dest_detail','aircraft_detail','yacht_detail',
  'status','trip_type','asset_type','lease_duration','subject','group_type',
  'cargo_type','urgency','inquiry_type',
])

const LONG_FIELDS = new Set([
  'Special Requests','Message','Description','Itinerary',
  'Usage Description','Notes','Cargo Description',
  'special_requests','message','cargo_description',
  'itinerary_description','usage_description','additional_notes',
])

function fmtVal(key, val) {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (key.includes('price') || key.includes('amount') || key.includes('usd') || key.includes('asking')) {
    const n = Number(val)
    return isNaN(n) ? val : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }
  if (key.includes('_at') || key.includes('datetime')) {
    try { return new Date(val).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return val }
  }
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function DetailModal({ item, type, onClose, onReply, onSetPrice }) {
  if (!item) return null
  const flat = { ...item }
  if (item.origin_detail) flat['origin_detail.code'] = `${item.origin_detail.code} – ${item.origin_detail.city}`
  if (item.dest_detail)   flat['dest_detail.code']   = `${item.dest_detail.code} – ${item.dest_detail.city}`

  const PRIORITY = [
    'guest_name','full_name','contact_name','client_name','guest_email','email','client_email',
    'guest_phone','phone','company','reference','created_at','status_display',
    'origin_detail.code','dest_detail.code','origin','destination',
    'departure_date','departure_datetime','departure_time','return_date','return_datetime',
    'departure_port','destination_port','charter_start','charter_end',
    'passenger_count','guest_count','group_size','estimated_hours',
    'quoted_price_usd','gross_amount_usd','asking_price_usd','budget_range',
  ]

  const shown = new Set()
  const rows = []
  for (const k of PRIORITY) {
    if (k in flat && !SKIP_KEYS.has(k) && !shown.has(k)) {
      const label = FIELD_LABELS[k] || k
      const val = fmtVal(k, flat[k])
      if (val !== '—') { rows.push([label, val, k]); shown.add(k) }
    }
  }
  for (const [k, v] of Object.entries(flat)) {
    if (shown.has(k) || SKIP_KEYS.has(k)) continue
    if (typeof v === 'object' && v !== null) continue
    const label = FIELD_LABELS[k]; if (!label) continue
    const val = fmtVal(k, v)
    if (val !== '—') { rows.push([label, val, k]); shown.add(k) }
  }

  const name = item.guest_name || item.full_name || item.contact_name || item.client_name || 'Contact'
  const emailAddr = item.guest_email || item.email || item.client_email || ''
  const phone = item.guest_phone || item.phone || ''
  const isFlightOrYacht = ['flight-bookings', 'yacht-charters'].includes(type)

  return (
    <Modal wide
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-eye" style={{ color: 'var(--gold)' }} />
          <span>Record Detail</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', fontWeight: 400 }}>
            {item.reference ? String(item.reference).slice(0, 12) : `#${item.id}`}
          </span>
        </div>
      }
      onClose={onClose}
    >
      <div className="detail-contact-banner">
        <div className="detail-contact-icon"><i className="bi bi-person-fill" /></div>
        <div>
          <div className="detail-contact-name">{name}</div>
          <div className="detail-contact-sub">
            {emailAddr}
            {phone && ` · ${phone}`}
            {item.company && ` · ${item.company}`}
          </div>
        </div>
        <div className="detail-contact-right">
          <span className={`mem-badge ${STATUS_BADGE[item.status] || 'mem-badge-gray'}`}>
            {item.status_display || item.status || 'pending'}
          </span>
          {(item.quoted_price_usd || item.gross_amount_usd) && (
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>
              ${Number(item.quoted_price_usd || item.gross_amount_usd).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {rows.map(([label, val, key]) => {
          const isLong = LONG_FIELDS.has(label) || LONG_FIELDS.has(key)
          return (
            <div key={label} className={`detail-field${isLong ? ' span-2' : ''}`}>
              <div className="detail-field-label">{label}</div>
              <div className="detail-field-value">{val}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--gray-100)', flexWrap: 'wrap' }}>
        <button onClick={onClose} className="btn btn-ghost btn-sm">
          <i className="bi bi-x" /> Close
        </button>
        <button onClick={() => { onClose(); onReply(item) }} className="btn btn-outline-navy btn-sm">
          <i className="bi bi-reply" /> Reply / Email
        </button>
        {isFlightOrYacht && (
          <button onClick={() => { onClose(); onSetPrice(item) }} className="btn btn-sm"
            style={{ background: 'var(--gold-subtle)', color: '#7a5c1e' }}>
            <i className="bi bi-currency-dollar" /> Set Price
          </button>
        )}
      </div>
    </Modal>
  )
}

/* ── Reply modal ──────────────────────────────────────────────────────────── */
function ReplyModal({ item, onClose, onSend, showPrice = false, showStatus = false, statusChoices = [] }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [price, setPrice]     = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await onSend({ subject, message, new_status: newStatus, quoted_price: price || null, send_email: sendEmail }) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={<><i className="bi bi-reply" style={{ color: 'var(--gold)', marginRight: 6 }} />Reply / Email</>} onClose={onClose}>
      <form onSubmit={handle}>
        {item && (
          <div className="mem-alert mem-alert-info" style={{ marginBottom: 14, fontSize: 12.5 }}>
            <i className="bi bi-person" />
            <span>
              <strong>{item.guest_name || item.full_name || item.contact_name || item.client_name || 'Contact'}</strong>
              {' · '}{item.guest_email || item.email || item.client_email}
            </span>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Subject <span className="req">*</span></label>
          <input className="form-control" required value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Your flight quote from NairobiJetHouse" />
        </div>
        <div className="form-group">
          <label className="form-label">Message <span className="req">*</span></label>
          <textarea className="form-control" required style={{ minHeight: 110 }} value={message}
            onChange={e => setMessage(e.target.value)} placeholder="Write your response…" />
        </div>
        {showPrice && (
          <div className="form-group">
            <label className="form-label">Quoted Price (USD)</label>
            <input className="form-control" type="number" step="0.01" value={price}
              onChange={e => setPrice(e.target.value)} placeholder="e.g. 12500.00" />
          </div>
        )}
        {showStatus && statusChoices.length > 0 && (
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">— Keep current —</option>
              {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <input type="checkbox" id="sendEmailCb" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
          <label htmlFor="sendEmailCb" style={{ cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', marginBottom: 0 }}>
            Send as email to contact
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? <><Spinner /> Sending…</> : <><i className="bi bi-send" /> Send Reply</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Set Price modal ──────────────────────────────────────────────────────── */
function SetPriceModal({ item, onClose, onSave, statusChoices }) {
  const [price, setPrice]     = useState(item?.quoted_price_usd || '')
  const [status, setStatus]   = useState(item?.status || '')
  const [emailMsg, setEmailMsg] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await onSave({ quoted_price_usd: parseFloat(price), status, send_email: sendEmail, email_message: emailMsg }) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={<><i className="bi bi-currency-dollar" style={{ color: 'var(--gold)', marginRight: 6 }} />Set Quoted Price</>} onClose={onClose}>
      <form onSubmit={handle}>
        <div className="form-group">
          <label className="form-label">Quoted Price (USD) <span className="req">*</span></label>
          <input className="form-control" type="number" step="0.01" required value={price}
            onChange={e => setPrice(e.target.value)} placeholder="e.g. 18500.00" />
        </div>
        {statusChoices && (
          <div className="form-group">
            <label className="form-label">Update Status</label>
            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
              {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Custom Email Message <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <textarea className="form-control" style={{ minHeight: 70 }} value={emailMsg}
            onChange={e => setEmailMsg(e.target.value)} placeholder="Override the default quote email…" />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <input type="checkbox" id="sendEmailCb2" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
          <label htmlFor="sendEmailCb2" style={{ cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', marginBottom: 0 }}>
            Email quote to contact
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button type="submit" className="btn btn-navy" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
            {loading ? <><Spinner /> Saving…</> : <><i className="bi bi-check" /> Save Quote</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Route Quote modal ────────────────────────────────────────────────────── */
function RouteQuoteModal({ onClose, defaultCommission }) {
  const [originQuery, setOriginQuery]   = useState('')
  const [destQuery, setDestQuery]       = useState('')
  const [originResults, setOriginResults] = useState([])
  const [destResults, setDestResults]   = useState([])
  const [origin, setOrigin]             = useState(null)
  const [dest, setDest]                 = useState(null)
  const [aircraftList, setAircraftList] = useState([])
  const [selectedAC, setSelectedAC]     = useState('')
  const [passengers, setPassengers]     = useState(1)
  const [catering, setCatering]         = useState(false)
  const [groundT, setGroundT]           = useState(false)
  const [concierge, setConcierge]       = useState(false)
  const [discount, setDiscount]         = useState(0)
  const [overrideComm, setOverrideComm] = useState('')
  const [result, setResult]             = useState(null)
  const [loading, setLoading]           = useState(false)
  const [acLoading, setAcLoading]       = useState(false)
  const [error, setError]               = useState('')
  const originTimer = useRef(null)
  const destTimer   = useRef(null)

  useEffect(() => {
    setAcLoading(true)
    getAircraft().then(d => setAircraftList(Array.isArray(d) ? d : d.results || []))
      .catch(() => {}).finally(() => setAcLoading(false))
  }, [])

  const searchOrig = (q) => {
    setOriginQuery(q); setOrigin(null); setResult(null)
    clearTimeout(originTimer.current)
    if (q.length < 2) { setOriginResults([]); return }
    originTimer.current = setTimeout(() =>
      searchAirports(q).then(d => setOriginResults(Array.isArray(d) ? d : d.results || [])).catch(() => {}), 320)
  }

  const searchDest_ = (q) => {
    setDestQuery(q); setDest(null); setResult(null)
    clearTimeout(destTimer.current)
    if (q.length < 2) { setDestResults([]); return }
    destTimer.current = setTimeout(() =>
      searchAirports(q).then(d => setDestResults(Array.isArray(d) ? d : d.results || [])).catch(() => {}), 320)
  }

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const calculate = useCallback(async () => {
    if (!origin || !dest || !selectedAC) return
    setError(''); setLoading(true); setResult(null)
    try {
      const ac = aircraftList.find(a => a.id === parseInt(selectedAC))
      if (!ac) throw new Error('Aircraft not found.')
      if (!origin.latitude || !dest.latitude) throw new Error('Airport coordinates missing.')
      const distKm = haversineKm(parseFloat(origin.latitude), parseFloat(origin.longitude), parseFloat(dest.latitude), parseFloat(dest.longitude))
      const hours  = distKm / (ac.cruise_speed_kmh || 800)
      const r = await calculatePrice({
        hourly_rate_usd: parseFloat(ac.hourly_rate_usd),
        estimated_hours: Math.round(hours * 10) / 10,
        passenger_count: parseInt(passengers),
        catering, ground_transport: groundT, concierge,
        discount_pct: parseFloat(discount || 0),
        commission_pct: overrideComm ? parseFloat(overrideComm) : undefined,
      })
      setResult({ ...r.breakdown, distance_km: Math.round(distKm), flight_hours: Math.round(hours * 10) / 10, aircraft: ac })
    } catch (e) { setError(e.message || 'Calculation failed.') }
    finally { setLoading(false) }
  }, [origin, dest, selectedAC, aircraftList, passengers, catering, groundT, concierge, discount, overrideComm])

  useEffect(() => { if (origin && dest && selectedAC) calculate() },
    [origin, dest, selectedAC, catering, groundT, concierge, discount, overrideComm])

  const AptDrop = ({ results, onSelect, onClear }) => results.length === 0 ? null : (
    <div className="apt-dropdown">
      {results.map(a => (
        <button key={a.id} type="button" className="apt-dropdown-item" onClick={() => { onSelect(a); onClear() }}>
          <strong>{a.code}</strong> — {a.name}
          <span style={{ color: 'var(--gray-400)', fontSize: 11, marginLeft: 6 }}>{a.city}, {a.country}</span>
        </button>
      ))}
    </div>
  )

  const AptSelected = ({ apt, onClear }) => (
    <div className="apt-selected">
      <i className="bi bi-geo-alt-fill" style={{ color: 'var(--gold)', fontSize: 13 }} />
      <span className="apt-selected-code">{apt.code}</span>
      <span className="apt-selected-name">{apt.city}, {apt.country}</span>
      <button type="button" className="apt-clear" onClick={onClear}>×</button>
    </div>
  )

  return (
    <Modal wide
      title={<><i className="bi bi-geo-alt" style={{ color: 'var(--gold)', marginRight: 6 }} />Route Price Calculator</>}
      onClose={onClose}
    >
      <div className="grid-2 mb-3">
        <div className="form-group mb-0" style={{ position: 'relative' }}>
          <label className="form-label">Origin Airport <span className="req">*</span></label>
          {origin
            ? <AptSelected apt={origin} onClear={() => { setOrigin(null); setOriginQuery(''); setResult(null) }} />
            : <>
                <input className="form-control" value={originQuery} onChange={e => searchOrig(e.target.value)}
                  placeholder="Search IATA or city…" autoComplete="off" />
                <AptDrop results={originResults} onSelect={setOrigin} onClear={() => setOriginResults([])} />
              </>
          }
        </div>
        <div className="form-group mb-0" style={{ position: 'relative' }}>
          <label className="form-label">Destination Airport <span className="req">*</span></label>
          {dest
            ? <AptSelected apt={dest} onClear={() => { setDest(null); setDestQuery(''); setResult(null) }} />
            : <>
                <input className="form-control" value={destQuery} onChange={e => searchDest_(e.target.value)}
                  placeholder="Search IATA or city…" autoComplete="off" />
                <AptDrop results={destResults} onSelect={setDest} onClear={() => setDestResults([])} />
              </>
          }
        </div>
      </div>

      {origin && dest && (
        <div className="route-result-banner mb-3">
          <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{origin.code}</span>
          <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: 12 }} />
          <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{dest.code}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>{origin.city} → {dest.city}</span>
          {result?.distance_km && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>
              {result.distance_km.toLocaleString()} km · {result.flight_hours}h
            </span>
          )}
        </div>
      )}

      <div className="form-group mb-3">
        <label className="form-label">Aircraft <span className="req">*</span></label>
        {acLoading
          ? <div style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 6 }}><Spinner /> Loading…</div>
          : <select className="form-control" value={selectedAC} onChange={e => { setSelectedAC(e.target.value); setResult(null) }}>
              <option value="">— Select aircraft —</option>
              {aircraftList.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} · ${Number(a.hourly_rate_usd).toLocaleString()}/hr · {a.cruise_speed_kmh || '?'} km/h
                </option>
              ))}
            </select>
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div className="form-group mb-0">
          <label className="form-label">Passengers</label>
          <input className="form-control" type="number" min="1" value={passengers} onChange={e => setPassengers(e.target.value)} />
        </div>
        <div className="form-group mb-0">
          <label className="form-label">Discount (%)</label>
          <input className="form-control" type="number" step="0.5" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} />
        </div>
        <div className="form-group mb-0">
          <label className="form-label">Override Comm (%)</label>
          <input className="form-control" type="number" step="0.5" value={overrideComm}
            onChange={e => setOverrideComm(e.target.value)} placeholder={`${defaultCommission}%`} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['catering', catering, setCatering, 'Catering'], ['groundT', groundT, setGroundT, 'Ground Transport'], ['concierge', concierge, setConcierge, 'Concierge']].map(([k, v, set, lbl]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer', color: 'var(--gray-600)' }}>
            <input type="checkbox" checked={v} onChange={e => set(e.target.checked)} /> {lbl}
          </label>
        ))}
      </div>

      {error && <div className="mem-alert mem-alert-danger mb-3"><i className="bi bi-exclamation-circle" /><span>{error}</span></div>}
      {loading && <div style={{ textAlign: 'center', padding: '16px 0' }}><Spinner /></div>}

      {result && !loading && (
        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-400)', marginBottom: 10 }}>
            Breakdown — {result.aircraft?.name}
          </div>
          {[
            ['Base Flight Cost',   `$${Number(result.base_flight_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
            [`Catering`,           `$${Number(result.catering_cost).toLocaleString()}`, false],
            ['Ground Transport',   `$${Number(result.ground_transport).toLocaleString()}`, false],
            ['Concierge',          `$${Number(result.concierge_cost).toLocaleString()}`, false],
            ['Subtotal',           `$${Number(result.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, true],
            [`Discount (${result.discount_pct}%)`, `-$${Number(result.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
            [`Commission (${result.commission_pct}%)`, `-$${Number(result.commission_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
            ['Owner Net',          `$${Number(result.owner_net_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
          ].map(([lbl, val, strong]) => (
            <div key={lbl} className="calc-row">
              <span className={`calc-row-label${strong ? ' strong' : ''}`}>{lbl}</span>
              <span className={`calc-row-value${strong ? ' strong' : ''}`}>{val}</span>
            </div>
          ))}
          <div className="price-total-bar">
            <div>
              <div className="price-total-bar-label">Grand Total</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {result.distance_km?.toLocaleString()} km · {result.flight_hours}h
              </div>
            </div>
            <div className="price-total-bar-value">
              ${Number(result.grand_total_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
        <button type="button" onClick={onClose} className="btn btn-ghost">Close</button>
        {origin && dest && selectedAC && (
          <button type="button" onClick={calculate} className="btn btn-navy" disabled={loading}>
            <i className="bi bi-arrow-clockwise" /> Recalculate
          </button>
        )}
      </div>
    </Modal>
  )
}

/* ── Generic Inquiry Table ─────────────────────────────────────────────────── */
function InquiryTable({ items, loading, onView, onReply, onDelete, onSetPrice,
  onStatusChange, renderMeta, showPrice, statusChoices, emptyIcon, emptyMsg }) {
  if (loading) return <TabLoading />
  if (!items.length) return <EmptyState icon={emptyIcon || 'bi-inbox'} message={emptyMsg || 'No records found.'} />
  return (
    <>
      {items.map(item => {
        const name  = item.guest_name || item.full_name || item.contact_name || item.client_name || 'Contact'
        const email = item.guest_email || item.email || item.client_email || ''
        const st    = item.status || 'pending'
        const ref   = item.reference ? String(item.reference).slice(0, 8) : `#${item.id}`
        return (
          <div key={item.id} className="inquiry-card">
            <div className="inquiry-card-header">
              <div>
                <div className="inquiry-card-name">
                  {name}
                  <span className="inquiry-card-ref"> · {ref}</span>
                </div>
                <div className="inquiry-card-email">{email}</div>
                {renderMeta && <div className="inquiry-card-meta">{renderMeta(item)}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className={`mem-badge ${STATUS_BADGE[st] || 'mem-badge-gray'}`}>
                  {item.status_display || st}
                </span>
                {item.quoted_price_usd && (
                  <span className="inquiry-card-price">
                    ${Number(item.quoted_price_usd).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="inquiry-card-actions">
              <button onClick={() => onView(item)} className="btn btn-ghost btn-sm" title="View details">
                <i className="bi bi-eye" />
              </button>
              <button onClick={() => onReply(item)} className="btn btn-outline-navy btn-sm">
                <i className="bi bi-reply" /> Reply
              </button>
              {onSetPrice && (
                <button onClick={() => onSetPrice(item)} className="btn btn-sm"
                  style={{ background: 'var(--gold-subtle)', color: '#7a5c1e' }}>
                  <i className="bi bi-currency-dollar" /> {showPrice ? 'Set Price' : 'Quote'}
                </button>
              )}
              {onStatusChange && statusChoices && (
                <select value={item.status} onChange={e => onStatusChange(item.id, e.target.value)}
                  className="status-select">
                  {statusChoices.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              )}
              {onDelete && (
                <button onClick={() => onDelete(item.id)} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
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

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
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
  const [revenueChart,   setRevenueChart]   = useState([])
  const [combinedRev,    setCombinedRev]    = useState(null)
  const [chartLoading,   setChartLoading]   = useState(false)
  const [newRate, setNewRate]   = useState('')
  const [rateNote, setRateNote] = useState('')
  const [rateSaving, setRateSaving] = useState(false)
  const [rateSuccess, setRateSuccess] = useState(false)
  const [resolvingId, setResolvingId] = useState(null)
  const [resolution,  setResolution]  = useState('')
  const [approving,   setApproving]   = useState(null)
  const [replyModal,  setReplyModal]  = useState(null)
  const [priceModal,  setPriceModal]  = useState(null)
  const [emailModal,  setEmailModal]  = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [routeQuoteOpen, setRouteQuoteOpen] = useState(false)
  const [calcResult,  setCalcResult]  = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [calcForm, setCalcForm] = useState({
    hourly_rate_usd: '', estimated_hours: '', passenger_count: 1,
    catering: false, ground_transport: false, concierge: false,
    discount_pct: 0, commission_pct: '',
  })
  const [toast, setToast] = useState(null)

  const navigate   = useNavigate()
  const user       = JSON.parse(localStorage.getItem('vj_user') || 'null')
  const showToast  = useCallback((message, type = 'success') => setToast({ message, type }), [])

  /* ── Initial load ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/membership/login'); return }
    Promise.all([
      getAdminDashboard(), getMarketplaceAircraft(), getDisputes(),
      getCommissionSettings(), adminGetInquiriesSummary(),
    ]).then(([s, a, d, c, inq]) => {
      setSummary(s)
      setAircraft(Array.isArray(a) ? a : a.results || [])
      setDisputes(Array.isArray(d) ? d : d.results || [])
      setCommissions(Array.isArray(c) ? c : c.results || [])
      setInquirySummary(inq)
    }).catch(() => navigate('/membership/login'))
    .finally(() => setLoading(false))
  }, [])

  /* ── Tab data loading ────────────────────────────────────────────────────── */
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

  /* ── Chart data ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (tab !== 'overview') return
    setChartLoading(true)
    Promise.all([adminGetRevenueChart(12), adminGetCombinedRevenue()])
      .then(([chart, combined]) => {
        setRevenueChart(chart.chart || [])
        setCombinedRev(combined)
      })
      .catch(() => {})
      .finally(() => setChartLoading(false))
  }, [tab])

  /* ── Handlers ────────────────────────────────────────────────────────────── */
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
      if (type === 'flight-bookings') adminGetFlightBookings().then(d => setFlightBookings(Array.isArray(d) ? d : d.results || []))
      if (type === 'yacht-charters')  adminGetYachtCharters().then(d => setYachtCharters(Array.isArray(d) ? d : d.results || []))
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      const fns = {
        'lease':           adminUpdateLeaseStatus,
        'group-charters':  adminUpdateGroupStatus,
        'air-cargo':       adminUpdateCargoStatus,
        'aircraft-sales':  adminUpdateAircraftSaleStatus,
        'mp-bookings':     adminUpdateMpBookingStatus,
        'flight-bookings': adminUpdateFlightStatus,
      }
      await fns[type](id, newStatus)
      showToast('Status updated.')
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this record permanently?')) return
    const fns = {
      'flight-bookings': adminDeleteFlightBooking,
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
      const refreshers = {
        'flight-bookings': [adminGetFlightBookings, setFlightBookings],
        'lease':           [adminGetLeaseInquiries, setLeaseInquiries],
        'contacts':        [adminGetContacts, setContacts],
        'group-charters':  [adminGetGroupCharters, setGroupCharters],
        'air-cargo':       [adminGetAirCargo, setAirCargo],
        'aircraft-sales':  [adminGetAircraftSales, setAircraftSales],
        'mp-bookings':     [adminGetMpBookings, setMpBookings],
      }
      if (refreshers[type]) {
        const [fn, setter] = refreshers[type]
        fn().then(d => setter(Array.isArray(d) ? d : d.results || []))
      }
    } catch (e) { showToast(e.message, 'error') }
  }

  const handleEmailUser = async (data) => {
    try {
      await adminEmailUser(emailModal.user.id, data)
      setEmailModal(null); showToast('Email sent to user.')
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
        estimated_hours: parseFloat(calcForm.estimated_hours),
        passenger_count: parseInt(calcForm.passenger_count),
        discount_pct:    parseFloat(calcForm.discount_pct || 0),
        commission_pct:  calcForm.commission_pct ? parseFloat(calcForm.commission_pct) : undefined,
        hourly_rate_usd: calcForm.hourly_rate_usd ? parseFloat(calcForm.hourly_rate_usd) : undefined,
      })
      setCalcResult(r.breakdown)
    } catch (e) { showToast(e.message, 'error') }
    finally { setCalcLoading(false) }
  }

  const handleSendMpConfirmation = async (id) => {
    try { await adminSendMpConfirmation(id, {}); showToast('Confirmation email sent to client.') }
    catch (e) { showToast(e.message, 'error') }
  }

  const changeTab = (id) => { setTab(id); setSidebarOpen(false) }
  const handleLogout = () => { clearTokens(); navigate('/') }

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const pendingAircraft = aircraft.filter(a => !a.is_approved)
  const openDisputes    = disputes.filter(d => d.status === 'open')
  const totalPending = (inquirySummary?.pending_flight_bookings || 0)
    + (inquirySummary?.pending_yacht_charters || 0)
    + (inquirySummary?.pending_contacts || 0)
    + (inquirySummary?.pending_group_charters || 0)
    + (inquirySummary?.pending_air_cargo || 0)
    + (inquirySummary?.pending_aircraft_sales || 0)
    + (inquirySummary?.pending_lease || 0)

  const navBadge = (id) => {
    const m = {
      approvals:        pendingAircraft.length,
      disputes:         openDisputes.length,
      'flight-bookings':inquirySummary?.pending_flight_bookings,
      'yacht-charters': inquirySummary?.pending_yacht_charters,
      contacts:         inquirySummary?.pending_contacts,
      'group-charters': inquirySummary?.pending_group_charters,
      'air-cargo':      inquirySummary?.pending_air_cargo,
      'aircraft-sales': inquirySummary?.pending_aircraft_sales,
      lease:            inquirySummary?.pending_lease,
    }
    const v = m[id]
    return v > 0 ? v : null
  }

  const isRedBadge = (id) => ['disputes', 'contacts', 'air-cargo'].includes(id)

  /* Shared table props helper */
  const tbl = (type) => ({
    onView:  item => setDetailModal({ item, type }),
    onReply: item => setReplyModal({ item, type }),
  })

  /* Status choice sets */
  const FLIGHT_STATUS  = [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['in_flight','In Flight'],['completed','Completed'],['cancelled','Cancelled']]
  const YACHT_STATUS   = [['inquiry','Inquiry'],['quoted','Quoted'],['confirmed','Confirmed'],['active','Active Charter'],['completed','Completed'],['cancelled','Cancelled']]
  const GENERIC_STATUS = [['pending','Pending'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']]

  const currentPage = PAGE_TITLES[tab] || PAGE_TITLES.overview

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
      <Spinner />
    </div>
  )

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="mem-shell">
      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Modals ── */}
      {detailModal && (
        <DetailModal
          item={detailModal.item} type={detailModal.type}
          onClose={() => setDetailModal(null)}
          onReply={item => setReplyModal({ item, type: detailModal.type })}
          onSetPrice={item => setPriceModal({ item, type: detailModal.type })}
        />
      )}
      {routeQuoteOpen && (
        <RouteQuoteModal onClose={() => setRouteQuoteOpen(false)} defaultCommission={summary?.commission_rate || 10} />
      )}
      {replyModal && (
        <ReplyModal
          item={replyModal.item} onClose={() => setReplyModal(null)} onSend={handleReply}
          showPrice={['flight-bookings', 'yacht-charters'].includes(replyModal.type)}
          showStatus
          statusChoices={
            replyModal.type === 'flight-bookings' ? FLIGHT_STATUS :
            replyModal.type === 'yacht-charters'  ? YACHT_STATUS  : GENERIC_STATUS
          }
        />
      )}
      {priceModal && (
        <SetPriceModal
          item={priceModal.item} onClose={() => setPriceModal(null)} onSave={handleSetPrice}
          statusChoices={priceModal.type === 'flight-bookings' ? FLIGHT_STATUS : YACHT_STATUS}
        />
      )}
      {emailModal && (
        <ReplyModal
          item={{ guest_name: emailModal.user.full_name, guest_email: emailModal.user.email }}
          onClose={() => setEmailModal(null)} onSend={handleEmailUser}
        />
      )}

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && <div className="mem-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`mem-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Close button (mobile) */}
        <button className="mem-sidebar-close" onClick={() => setSidebarOpen(false)}>
          <i className="bi bi-x" />
        </button>

        {/* Brand */}
        <div className="mem-sidebar-brand">
          <div className="mem-sidebar-brand-icon"><i className="bi bi-shield-check" /></div>
          <div>
            <div className="mem-sidebar-brand-text">NairobiJetHouse</div>
            <div className="mem-sidebar-brand-sub">Admin Console</div>
          </div>
        </div>

        {/* User */}
        <div className="mem-sidebar-user">
          <div className="mem-sidebar-avatar"><i className="bi bi-person" /></div>
          <div className="mem-sidebar-user-info">
            <div className="mem-sidebar-name">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </div>
            <div className="mem-sidebar-role">Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mem-nav">
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="mem-nav-section">{item.section}</div>
            const badge = navBadge(item.id)
            return (
              <button key={item.id} className={`mem-nav-item${tab === item.id ? ' active' : ''}`}
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

        {/* Footer */}
        <div className="mem-sidebar-footer">
          <button className="mem-nav-item" onClick={handleLogout}
            style={{ color: 'rgba(255,120,120,0.65)', borderRadius: 'var(--radius)' }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="mem-main">
        {/* Topbar */}
        <div className="mem-topbar">
          <div className="mem-topbar-left">
            <button className="mem-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <i className="bi bi-list" />
            </button>
            <div className="mem-page-title">
              <i className={`bi ${currentPage.icon}`} />
              {currentPage.label}
            </div>
          </div>
          <div className="mem-topbar-right">
            {summary && (
              <div className="mem-topbar-meta">
                <span><strong>{summary.total_members}</strong> members</span>
                <div className="topbar-divider" />
                <span><strong>{summary.total_aircraft}</strong> aircraft</span>
                <div className="topbar-divider" />
                <span className="gold"><strong>{summary.commission_rate}%</strong> commission</span>
                {totalPending > 0 && (
                  <>
                    <div className="topbar-divider" />
                    <span style={{ color: 'var(--danger)' }}><strong>{totalPending}</strong> pending</span>
                  </>
                )}
              </div>
            )}
            <span className="mem-admin-badge">Admin</span>
          </div>
        </div>

        {/* Content */}
        <div className="mem-content">

          {/* System alerts */}
          {pendingAircraft.length > 0 && tab !== 'approvals' && (
            <div className="mem-alert mem-alert-warning">
              <i className="bi bi-hourglass-split" />
              <span><strong>{pendingAircraft.length}</strong> aircraft pending approval.</span>
              <button onClick={() => setTab('approvals')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--warning)', fontSize: 12, textDecoration: 'underline' }}>
                Review →
              </button>
            </div>
          )}
          {openDisputes.length > 0 && tab !== 'disputes' && (
            <div className="mem-alert mem-alert-danger">
              <i className="bi bi-flag-fill" />
              <span><strong>{openDisputes.length}</strong> open disputes need attention.</span>
              <button onClick={() => setTab('disputes')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--danger)', fontSize: 12, textDecoration: 'underline' }}>
                View →
              </button>
            </div>
          )}

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          {tab === 'overview' && summary && (
            <>
              {/* Stat cards */}
              <div className="grid-4 mb-4">
                <StatCard icon="bi-cash-stack"  label="Platform Revenue"  accent="mem-stat-accent-green"
                  value={`$${Number(summary.total_platform_revenue || 0).toLocaleString()}`} sub="All completed bookings" />
                <StatCard icon="bi-percent"     label="Total Commissions" accent="mem-stat-accent"
                  value={`$${Number(summary.total_commissions || 0).toLocaleString()}`} sub={`At ${summary.commission_rate}% rate`} />
                <StatCard icon="bi-people"      label="Active Members"    accent="mem-stat-accent-blue"
                  value={summary.total_members || 0} sub="Subscribed" />
                <StatCard icon="bi-airplane"    label="Approved Aircraft" accent="mem-stat-accent-purple"
                  value={summary.total_aircraft || 0} sub="Listed & active" />
              </div>

              {/* Inquiry summary */}
              {inquirySummary && (
                <div className="mem-panel mb-4">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-inbox" /> Inquiry Summary</div>
                  </div>
                  <div className="mem-panel-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                      {[
                        ['Flight Bookings', inquirySummary.flight_bookings, inquirySummary.pending_flight_bookings, 'flight-bookings', 'bi-airplane'],
                        ['Yacht Charters',  inquirySummary.yacht_charters,  inquirySummary.pending_yacht_charters,  'yacht-charters',  'bi-water'],
                        ['Lease',           inquirySummary.lease_inquiries, inquirySummary.pending_lease,           'lease',           'bi-file-earmark-text'],
                        ['Contacts',        inquirySummary.contacts,        inquirySummary.pending_contacts,        'contacts',        'bi-envelope'],
                        ['Group Charters',  inquirySummary.group_charters,  inquirySummary.pending_group_charters,  'group-charters',  'bi-people'],
                        ['Air Cargo',       inquirySummary.air_cargo,       inquirySummary.pending_air_cargo,       'air-cargo',       'bi-box-seam'],
                        ['Aircraft Sales',  inquirySummary.aircraft_sales,  inquirySummary.pending_aircraft_sales,  'aircraft-sales',  'bi-tags'],
                      ].map(([label, total, pending, tabId, icon]) => (
                        <button key={tabId} className="inq-summary-card" onClick={() => setTab(tabId)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: 16 }} />
                            {pending > 0 && <span className="mem-badge mem-badge-red">{pending}</span>}
                          </div>
                          <div className="inq-summary-card-count">{total}</div>
                          <div className="inq-summary-card-label">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Platform health + Revenue split */}
              <div className="grid-2 mb-4">
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-pie-chart" /> Revenue Split</div>
                  </div>
                  <div className="mem-panel-body">
                    <div className="mem-revenue-bar" style={{ marginBottom: 10 }}>
                      <div className="mem-revenue-bar-platform" style={{ width: `${summary.commission_rate}%` }}>
                        <span>{summary.commission_rate}%</span>
                      </div>
                      <div className="mem-revenue-bar-owner">
                        <span>{100 - Number(summary.commission_rate)}%</span>
                      </div>
                    </div>
                    <div className="mem-legend mb-3">
                      <span><span className="mem-legend-dot" style={{ background: 'var(--navy)' }} />Platform</span>
                      <span><span className="mem-legend-dot" style={{ background: 'var(--gold)' }} />Owners</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        ['Platform earns', `$${Number(summary.total_commissions || 0).toLocaleString()}`, 'var(--navy)'],
                        ['Owners earned', `$${Number((summary.total_platform_revenue || 0) - (summary.total_commissions || 0)).toLocaleString()}`, 'var(--success)'],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                          <div style={{ fontSize: 10, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-activity" /> Platform Health</div>
                  </div>
                  <div className="mem-panel-body">
                    {[
                      ['Active Members',    summary.total_members || 0,    'bi-people',        'var(--navy)'],
                      ['Approved Aircraft', summary.total_aircraft || 0,   'bi-airplane',      'var(--info)'],
                      ['Pending Approvals', summary.pending_approvals || 0,'bi-hourglass-split','#d97706'],
                      ['Open Disputes',     summary.open_disputes || 0,    'bi-flag',          'var(--danger)'],
                      ['Commission Rate',   `${summary.commission_rate}%`, 'bi-percent',       'var(--gold)'],
                    ].map(([label, val, icon, color]) => (
                      <div key={label} className="health-row">
                        <div className="health-row-label">
                          <i className={`bi ${icon}`} style={{ color }} />{label}
                        </div>
                        <div className="health-row-value" style={{ color }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Revenue charts */}
              {chartLoading && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}><Spinner /></div>
              )}

              {!chartLoading && revenueChart.length > 0 && (
                <div className="grid-2 mb-4">
                  <div className="mem-panel">
                    <div className="mem-panel-header">
                      <div className="mem-panel-title"><i className="bi bi-bar-chart-fill" /> Monthly Revenue</div>
                    </div>
                    <div className="mem-panel-body chart-container">
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={revenueChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}
                            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-md)' }} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                          <Bar dataKey="gross_usd"      name="Gross"      fill="var(--navy)" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="commission_usd" name="Commission" fill="var(--gold)"  radius={[3, 3, 0, 0]} />
                          <Bar dataKey="net_usd"        name="Net"        fill="#34d399"     radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="mem-panel">
                    <div className="mem-panel-header">
                      <div className="mem-panel-title"><i className="bi bi-graph-up" /> Bookings Trend</div>
                    </div>
                    <div className="mem-panel-body chart-container">
                      <ResponsiveContainer width="100%" height={210}>
                        <LineChart data={revenueChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-md)' }} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                          <Line type="monotone" dataKey="confirmed_count" name="Bookings"
                            stroke="var(--navy)" strokeWidth={2.5}
                            dot={{ r: 3, fill: 'var(--navy)' }}
                            activeDot={{ r: 5, fill: 'var(--gold)' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {!chartLoading && combinedRev && (
                <div className="grid-2 mb-4">
                  <div className="mem-panel">
                    <div className="mem-panel-header">
                      <div className="mem-panel-title"><i className="bi bi-layers" /> Combined Revenue</div>
                    </div>
                    <div className="mem-panel-body">
                      {[
                        ['Flight Bookings Gross',   combinedRev.flight_bookings?.gross,       'var(--navy)'],
                        ['Flight Commissions',      combinedRev.flight_bookings?.commission,  'var(--gold)'],
                        ['Marketplace Gross',       combinedRev.marketplace_bookings?.gross,  'var(--navy)'],
                        ['Marketplace Commissions', combinedRev.marketplace_bookings?.commission, 'var(--gold)'],
                      ].map(([label, val, color]) => (
                        <div key={label} className="calc-row">
                          <span className="calc-row-label">{label}</span>
                          <span className="calc-row-value" style={{ color }}>
                            ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                      <div className="price-total-bar mt-3">
                        <div>
                          <div className="price-total-bar-label">All-Time Net</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>After commissions</div>
                        </div>
                        <div className="price-total-bar-value">
                          ${Number(combinedRev.combined?.net || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mem-panel">
                    <div className="mem-panel-header">
                      <div className="mem-panel-title"><i className="bi bi-pie-chart-fill" /> Revenue Split (All Time)</div>
                    </div>
                    <div className="mem-panel-body chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Platform', value: Number(combinedRev.combined?.commission || 0) },
                              { name: 'Owners',   value: Number(combinedRev.combined?.net || 0) },
                            ]}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={78}
                            paddingAngle={3} dataKey="value"
                          >
                            <Cell fill="var(--navy)" />
                            <Cell fill="var(--gold)" />
                          </Pie>
                          <Tooltip
                            formatter={v => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--gray-100)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title"><i className="bi bi-lightning" /> Quick Actions</div>
                </div>
                <div className="mem-panel-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    ['flight-bookings', 'bi-airplane',    'Flight Bookings'],
                    ['yacht-charters',  'bi-water',        'Yacht Charters'],
                    ['approvals',       'bi-check-circle', 'Approvals'],
                    ['disputes',        'bi-flag',         'Disputes'],
                    ['price-calc',      'bi-calculator',   'Price Calc'],
                    ['commission',      'bi-percent',      'Commission'],
                    ['users',           'bi-people-fill',  'Users'],
                  ].map(([tabId, icon, label]) => {
                    const badge = navBadge(tabId)
                    return (
                      <button key={tabId} onClick={() => setTab(tabId)} className="btn btn-outline-navy btn-sm">
                        <i className={`bi ${icon}`} /> {label}
                        {badge > 0 && (
                          <span style={{ background: 'var(--gold)', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 10, marginLeft: 2 }}>
                            {badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  <button onClick={() => setRouteQuoteOpen(true)} className="btn btn-sm"
                    style={{ background: 'var(--gold-subtle)', color: '#7a5c1e' }}>
                    <i className="bi bi-geo-alt" /> Route Quote
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ FLIGHT BOOKINGS ═══════════════════════════════════════════════ */}
          {tab === 'flight-bookings' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-airplane" /> Flight Bookings
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{flightBookings.length}</span>
                </div>
                <button onClick={() => setRouteQuoteOpen(true)} className="btn btn-sm"
                  style={{ background: 'var(--gold-subtle)', color: '#7a5c1e' }}>
                  <i className="bi bi-geo-alt" /> Route Quote
                </button>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={flightBookings} loading={tabLoading} {...tbl('flight-bookings')}
                  onSetPrice={item => setPriceModal({ item, type: 'flight-bookings' })}
                  onDelete={id => handleDelete(id, 'flight-bookings')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'flight-bookings')}
                  showPrice statusChoices={FLIGHT_STATUS}
                  emptyIcon="bi-airplane" emptyMsg="No flight booking inquiries yet."
                  renderMeta={item => (
                    <span>
                      <i className="bi bi-geo-alt" />
                      {item.origin_detail?.code || '—'} → {item.dest_detail?.code || '—'} · {item.departure_date} · {item.passenger_count} pax · {item.trip_type_display}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ YACHT CHARTERS ════════════════════════════════════════════════ */}
          {tab === 'yacht-charters' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-water" /> Yacht Charters
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{yachtCharters.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={yachtCharters} loading={tabLoading} {...tbl('yacht-charters')}
                  onSetPrice={item => setPriceModal({ item, type: 'yacht-charters' })} showPrice
                  statusChoices={YACHT_STATUS}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'yacht-charters')}
                  emptyIcon="bi-water" emptyMsg="No yacht charter inquiries."
                  renderMeta={item => (
                    <span>
                      {item.departure_port}{item.destination_port ? ` → ${item.destination_port}` : ''} · {item.charter_start} – {item.charter_end} · {item.guest_count} guests
                      {item.yacht_name && <> · <strong>{item.yacht_name}</strong></>}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ LEASE ═════════════════════════════════════════════════════════ */}
          {tab === 'lease' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-file-earmark-text" /> Lease Inquiries
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{leaseInquiries.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={leaseInquiries} loading={tabLoading} {...tbl('lease')}
                  onDelete={id => handleDelete(id, 'lease')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'lease')}
                  statusChoices={GENERIC_STATUS}
                  emptyIcon="bi-file-earmark-text" emptyMsg="No lease inquiries."
                  renderMeta={item => (
                    <span>{item.asset_type_display} · {item.lease_duration_display} · Starts {item.preferred_start_date}{item.budget_range && ` · Budget: ${item.budget_range}`}</span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ CONTACTS ══════════════════════════════════════════════════════ */}
          {tab === 'contacts' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-envelope" /> Contact Inquiries
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{contacts.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={contacts} loading={tabLoading} {...tbl('contacts')}
                  onDelete={id => handleDelete(id, 'contacts')}
                  emptyIcon="bi-envelope" emptyMsg="No contact inquiries."
                  renderMeta={item => (
                    <span>
                      <span className={`mem-badge ${STATUS_BADGE[item.subject] || 'mem-badge-gray'}`} style={{ fontSize: 10 }}>
                        {item.subject_display || item.subject}
                      </span>
                      {item.company && <> · {item.company}</>}
                      <div style={{ marginTop: 3, color: 'var(--gray-400)', fontStyle: 'italic', fontSize: 12 }}>
                        {item.message?.slice(0, 80)}…
                      </div>
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ GROUP CHARTERS ════════════════════════════════════════════════ */}
          {tab === 'group-charters' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-people" /> Group Charter Inquiries
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{groupCharters.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={groupCharters} loading={tabLoading} {...tbl('group-charters')}
                  onDelete={id => handleDelete(id, 'group-charters')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'group-charters')}
                  statusChoices={GENERIC_STATUS}
                  emptyIcon="bi-people" emptyMsg="No group charter inquiries."
                  renderMeta={item => (
                    <span>
                      {item.group_type_display} · {item.group_size} pax · {item.origin_description} → {item.destination_description}
                      {item.departure_date && ` · ${item.departure_date}`}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ AIR CARGO ═════════════════════════════════════════════════════ */}
          {tab === 'air-cargo' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-box-seam" /> Air Cargo Inquiries
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{airCargo.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={airCargo} loading={tabLoading} {...tbl('air-cargo')}
                  onDelete={id => handleDelete(id, 'air-cargo')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'air-cargo')}
                  statusChoices={GENERIC_STATUS}
                  emptyIcon="bi-box-seam" emptyMsg="No air cargo inquiries."
                  renderMeta={item => (
                    <span>
                      {item.cargo_type_display} · {item.urgency_display} · {item.origin_description} → {item.destination_description}
                      {item.weight_kg && ` · ${item.weight_kg}kg`}
                      {item.is_hazardous && <span className="mem-badge mem-badge-red" style={{ fontSize: 10, marginLeft: 6 }}>Hazardous</span>}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ AIRCRAFT SALES ════════════════════════════════════════════════ */}
          {tab === 'aircraft-sales' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-tags" /> Aircraft Sales Inquiries
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{aircraftSales.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                <InquiryTable items={aircraftSales} loading={tabLoading} {...tbl('aircraft-sales')}
                  onDelete={id => handleDelete(id, 'aircraft-sales')}
                  onStatusChange={(id, s) => handleStatusChange(id, s, 'aircraft-sales')}
                  statusChoices={GENERIC_STATUS}
                  emptyIcon="bi-tags" emptyMsg="No aircraft sales inquiries."
                  renderMeta={item => (
                    <span>
                      {item.inquiry_type_display}
                      {item.preferred_category && ` · ${item.preferred_category}`}
                      {item.budget_range_display && ` · ${item.budget_range_display}`}
                      {item.aircraft_make && ` · ${item.aircraft_make} ${item.aircraft_model}`}
                      {item.year_of_manufacture && ` (${item.year_of_manufacture})`}
                    </span>
                  )}
                />
              </div>
            </div>
          )}

          {/* ══ APPROVALS ═════════════════════════════════════════════════════ */}
          {tab === 'approvals' && (
            <>
              <div className="mem-panel mb-4">
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-hourglass-split" /> Pending Approval
                    {pendingAircraft.length > 0 && (
                      <span className="mem-badge mem-badge-orange" style={{ marginLeft: 6 }}>{pendingAircraft.length}</span>
                    )}
                  </div>
                </div>
                <div className="mem-panel-body">
                  {pendingAircraft.length === 0
                    ? <EmptyState icon="bi-check-circle" message="No pending approvals." />
                    : pendingAircraft.map(a => (
                      <div key={a.id} className="approval-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div className="approval-card-name">{a.name}</div>
                            <div className="approval-card-sub">{a.registration_number} · {a.model} · {a.category_display}</div>
                            <div className="approval-card-details">
                              <span><i className="bi bi-geo-alt" />{a.base_location}</span>
                              <span><i className="bi bi-people" />{a.passenger_capacity} pax</span>
                              <span><i className="bi bi-currency-dollar" />${Number(a.hourly_rate_usd).toLocaleString()}/hr</span>
                              <span><i className="bi bi-person" />{a.owner_name}</span>
                            </div>
                          </div>
                          <button onClick={() => handleApprove(a.id)} className="btn btn-navy btn-sm" disabled={approving === a.id}>
                            {approving === a.id ? <><Spinner /> Approving…</> : <><i className="bi bi-check-lg" /> Approve & List</>}
                          </button>
                        </div>
                        {a.description && (
                          <div style={{ fontSize: 12.5, color: 'var(--gray-500)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', lineHeight: 1.6 }}>
                            {a.description}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title">
                    <i className="bi bi-check-circle" /> Approved Aircraft
                    <span className="mem-badge mem-badge-green" style={{ marginLeft: 6 }}>{aircraft.filter(a => a.is_approved).length}</span>
                  </div>
                </div>
                <div className="mem-panel-body">
                  {aircraft.filter(a => a.is_approved).map(a => (
                    <div key={a.id} className="mem-row">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--navy)' }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.registration_number} · {a.owner_name}</div>
                      </div>
                      <span className="mem-badge mem-badge-green"><i className="bi bi-check" /> Approved</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ MP BOOKINGS ═══════════════════════════════════════════════════ */}
          {tab === 'mp-bookings' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-calendar3" /> Marketplace Bookings
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{mpBookings.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <TabLoading />
                  : mpBookings.length === 0 ? <EmptyState icon="bi-calendar3" message="No marketplace bookings." />
                  : mpBookings.map(b => (
                    <div key={b.id} className="booking-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                        <div>
                          <div className="booking-card-route">
                            {b.origin} → {b.destination}
                            <span className="booking-card-ref">{String(b.reference).slice(0, 8)}</span>
                          </div>
                          <div className="booking-card-meta">
                            <i className="bi bi-person" />{b.client_name} · {b.client_email} ·{' '}
                            <i className="bi bi-airplane" />{b.aircraft_name}
                          </div>
                          <div className="booking-card-meta">
                            {new Date(b.departure_datetime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {b.passenger_count} pax
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`mem-badge ${STATUS_BADGE[b.status] || 'mem-badge-gray'}`}>{b.status_display || b.status}</span>
                          <div className="booking-card-amount" style={{ marginTop: 4 }}>${Number(b.gross_amount_usd).toLocaleString()}</div>
                          <div className="booking-card-commission">
                            Comm: ${Number(b.commission_usd).toLocaleString()} · Owner: ${Number(b.net_owner_usd).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="inquiry-card-actions">
                        <button onClick={() => setDetailModal({ item: b, type: 'mp-bookings' })} className="btn btn-ghost btn-sm">
                          <i className="bi bi-eye" />
                        </button>
                        <button onClick={() => handleSendMpConfirmation(b.id)} className="btn btn-outline-navy btn-sm">
                          <i className="bi bi-send" /> Confirm
                        </button>
                        <select value={b.status} onChange={e => handleStatusChange(b.id, e.target.value, 'mp-bookings')}
                          className="status-select">
                          {[['pending','Pending'],['confirmed','Confirmed'],['in_flight','In Flight'],['completed','Completed'],['cancelled','Cancelled'],['disputed','Disputed']].map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <button onClick={() => handleDelete(b.id, 'mp-bookings')} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ DISPUTES ══════════════════════════════════════════════════════ */}
          {tab === 'disputes' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title"><i className="bi bi-flag" /> All Disputes</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="mem-badge mem-badge-red">{openDisputes.length} open</span>
                  <span className="mem-badge mem-badge-green">{disputes.filter(d => d.status === 'resolved').length} resolved</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {disputes.length === 0 ? <EmptyState icon="bi-check-circle" message="No disputes found." />
                  : disputes.map(d => (
                    <div key={d.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--navy)', marginBottom: 3 }}>{d.subject}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                            Raised by <strong>{d.raised_by_name}</strong> · {new Date(d.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                          </div>
                        </div>
                        <span className={`mem-badge ${DISPUTE_BADGE[d.status] || 'mem-badge-gray'}`}>{d.status_display || d.status}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 10 }}>{d.description}</p>
                      {d.resolution && (
                        <div className="mem-alert mem-alert-success" style={{ marginBottom: 10, fontSize: 13 }}>
                          <i className="bi bi-check-circle-fill" /><span><strong>Resolution:</strong> {d.resolution}</span>
                        </div>
                      )}
                      {d.status === 'open' && (
                        resolvingId === d.id ? (
                          <div className="dispute-resolve-box">
                            <textarea className="form-control" style={{ minHeight: 70, marginBottom: 8, fontSize: 13 }}
                              placeholder="Describe the resolution…" value={resolution} onChange={e => setResolution(e.target.value)} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => { setResolvingId(null); setResolution('') }} className="btn btn-ghost btn-sm">Cancel</button>
                              <button onClick={() => handleResolve(d.id)} className="btn btn-navy btn-sm">
                                <i className="bi bi-check" /> Mark Resolved
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setResolvingId(d.id)} className="btn btn-outline-navy btn-sm">
                            Resolve Dispute
                          </button>
                        )
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ USERS ═════════════════════════════════════════════════════════ */}
          {tab === 'users' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-people-fill" /> Users
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{users.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <TabLoading />
                  : users.length === 0 ? <EmptyState icon="bi-people" message="No users found." />
                  : users.map(u => (
                    <div key={u.id} className="mem-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="user-avatar-sm"><i className="bi bi-person" /></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--navy)' }}>{u.full_name || u.username}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                            {u.email}{u.company && ` · ${u.company}`}
                          </div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            <span className={`mem-badge ${u.role === 'admin' ? 'mem-badge-red' : u.role === 'owner' ? 'mem-badge-blue' : 'mem-badge-navy'}`} style={{ fontSize: 10 }}>
                              {u.role}
                            </span>
                            {u.membership_tier && (
                              <span className="mem-badge mem-badge-gold" style={{ fontSize: 10 }}>{u.membership_tier}</span>
                            )}
                            {!u.is_active && (
                              <span className="mem-badge mem-badge-gray" style={{ fontSize: 10 }}>Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEmailModal({ user: u })} className="btn btn-outline-navy btn-sm">
                          <i className="bi bi-envelope" /> Email
                        </button>
                        <button onClick={() => handleToggleUser(u.id)} className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}>
                          <i className={`bi ${u.is_active ? 'bi-slash-circle' : 'bi-check-circle'}`} />
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ══ COMMISSION ════════════════════════════════════════════════════ */}
          {tab === 'commission' && (
            <>
              <div className="commission-hero">
                <div>
                  <div className="commission-hero-label">Current Commission Rate</div>
                  <div className="commission-hero-rate">{summary?.commission_rate}%</div>
                  <div className="commission-hero-sub">Owners receive {100 - Number(summary?.commission_rate || 0)}% per booking</div>
                </div>
                <div>
                  <div className="commission-hero-amount-label">Platform total earned</div>
                  <div className="commission-hero-amount">${Number(summary?.total_commissions || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-sliders" /> Set New Rate</div>
                  </div>
                  <div className="mem-panel-body">
                    {rateSuccess && (
                      <div className="mem-alert mem-alert-success">
                        <i className="bi bi-check-circle-fill" /> Rate updated successfully.
                      </div>
                    )}
                    <form onSubmit={handleSetRate}>
                      <div className="form-group">
                        <label className="form-label">New Rate (%) <span className="req">*</span></label>
                        <input className="form-control" type="number" step="0.5" min="0" max="50" required
                          value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g. 12.5" />
                      </div>
                      <div className="form-group mb-4">
                        <label className="form-label">Notes</label>
                        <input className="form-control" value={rateNote} onChange={e => setRateNote(e.target.value)} placeholder="Optional reason" />
                      </div>
                      {newRate && (
                        <div className="mem-alert mem-alert-info mb-3">
                          <i className="bi bi-info-circle" />
                          <span>Platform: <strong>{newRate}%</strong> · Owners: <strong>{(100 - parseFloat(newRate || 0)).toFixed(1)}%</strong></span>
                        </div>
                      )}
                      <button type="submit" className="btn btn-navy" disabled={rateSaving} style={{ width: '100%', justifyContent: 'center' }}>
                        {rateSaving ? <><Spinner /> Saving…</> : <><i className="bi bi-check" /> Apply New Rate</>}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mem-panel">
                  <div className="mem-panel-header">
                    <div className="mem-panel-title"><i className="bi bi-clock-history" /> Rate History</div>
                  </div>
                  <div className="mem-panel-body">
                    {commissions.length === 0 ? <EmptyState icon="bi-clock-history" message="No rate history yet." />
                      : commissions.map((c, i) => (
                        <div key={c.id} className="mem-row">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="rate-history-value">{c.rate_pct}%</span>
                              {i === 0 && <span className="mem-badge mem-badge-green">Current</span>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                              Effective {c.effective_from}{c.notes && ` · ${c.notes}`}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gray-300)' }}>
                            {new Date(c.created_at).toLocaleDateString('en-GB', { dateStyle: 'short' })}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ PRICE CALCULATOR ══════════════════════════════════════════════ */}
          {tab === 'price-calc' && (
            <div className="grid-2">
              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title"><i className="bi bi-calculator" /> Price Calculator</div>
                  <button onClick={() => setRouteQuoteOpen(true)} className="btn btn-sm"
                    style={{ background: 'var(--gold-subtle)', color: '#7a5c1e' }}>
                    <i className="bi bi-geo-alt" /> Route Quote
                  </button>
                </div>
                <div className="mem-panel-body">
                  <form onSubmit={handleCalc}>
                    <div className="form-group">
                      <label className="form-label">Hourly Rate (USD) <span className="req">*</span></label>
                      <input className="form-control" type="number" step="0.01" required
                        value={calcForm.hourly_rate_usd} onChange={e => setCalcForm(f => ({ ...f, hourly_rate_usd: e.target.value }))}
                        placeholder="e.g. 4500" />
                    </div>
                    <div className="grid-2" style={{ gap: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Est. Hours <span className="req">*</span></label>
                        <input className="form-control" type="number" step="0.5" required
                          value={calcForm.estimated_hours} onChange={e => setCalcForm(f => ({ ...f, estimated_hours: e.target.value }))}
                          placeholder="e.g. 3.5" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Passengers</label>
                        <input className="form-control" type="number" min="1"
                          value={calcForm.passenger_count} onChange={e => setCalcForm(f => ({ ...f, passenger_count: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: 10 }}>
                      <div className="form-group">
                        <label className="form-label">Discount (%)</label>
                        <input className="form-control" type="number" step="0.5" min="0" max="100"
                          value={calcForm.discount_pct} onChange={e => setCalcForm(f => ({ ...f, discount_pct: e.target.value }))} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Override Comm (%)</label>
                        <input className="form-control" type="number" step="0.5"
                          value={calcForm.commission_pct} onChange={e => setCalcForm(f => ({ ...f, commission_pct: e.target.value }))}
                          placeholder={`Default: ${summary?.commission_rate}%`} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                      {[['catering', 'Catering (+$500/pax)'], ['ground_transport', 'Ground Transport (+$800)'], ['concierge', 'Concierge (+$400)']].map(([key, label]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer', color: 'var(--gray-600)' }}>
                          <input type="checkbox" checked={calcForm[key]} onChange={e => setCalcForm(f => ({ ...f, [key]: e.target.checked }))} />
                          {label}
                        </label>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-navy" disabled={calcLoading} style={{ width: '100%', justifyContent: 'center' }}>
                      {calcLoading ? <><Spinner /> Calculating…</> : <><i className="bi bi-calculator" /> Calculate Price</>}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mem-panel">
                <div className="mem-panel-header">
                  <div className="mem-panel-title"><i className="bi bi-receipt" /> Price Breakdown</div>
                </div>
                <div className="mem-panel-body">
                  {!calcResult ? <EmptyState icon="bi-calculator" message="Enter flight details and click Calculate." />
                    : (
                      <>
                        {[
                          ['Base Flight Cost',  `$${Number(calcResult.base_flight_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
                          ['Catering',          `$${Number(calcResult.catering_cost).toLocaleString()}`, false],
                          ['Ground Transport',  `$${Number(calcResult.ground_transport).toLocaleString()}`, false],
                          ['Concierge',         `$${Number(calcResult.concierge_cost).toLocaleString()}`, false],
                          ['Subtotal',          `$${Number(calcResult.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, true],
                          [`Discount (${calcResult.discount_pct}%)`, `-$${Number(calcResult.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
                          [`Commission (${calcResult.commission_pct}%)`, `-$${Number(calcResult.commission_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
                          ['Owner Net',         `$${Number(calcResult.owner_net_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, false],
                        ].map(([label, val, strong]) => (
                          <div key={label} className="calc-row">
                            <span className={`calc-row-label${strong ? ' strong' : ''}`}>{label}</span>
                            <span className={`calc-row-value${strong ? ' strong' : ''}`}>{val}</span>
                          </div>
                        ))}
                        <div className="price-total-bar mt-3">
                          <span className="price-total-bar-label">Grand Total</span>
                          <span className="price-total-bar-value">
                            ${Number(calcResult.grand_total_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ══ EMAIL LOGS ════════════════════════════════════════════════════ */}
          {tab === 'email-logs' && (
            <div className="mem-panel">
              <div className="mem-panel-header">
                <div className="mem-panel-title">
                  <i className="bi bi-send-check" /> Email Logs
                  <span className="mem-badge mem-badge-navy" style={{ marginLeft: 6 }}>{emailLogs.length}</span>
                </div>
              </div>
              <div className="mem-panel-body">
                {tabLoading ? <TabLoading />
                  : emailLogs.length === 0 ? <EmptyState icon="bi-send" message="No emails sent yet." />
                  : emailLogs.map(log => (
                    <div key={log.id} className="mem-row">
                      <div>
                        <div className="email-log-subject">{log.subject}</div>
                        <div className="email-log-meta">
                          To: <strong>{log.to_name || log.to_email}</strong> ({log.to_email}) · {log.inquiry_type} ·{' '}
                          {new Date(log.sent_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        {log.error_msg && (
                          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>Error: {log.error_msg}</div>
                        )}
                      </div>
                      <span className={`mem-badge ${log.success ? 'mem-badge-green' : 'mem-badge-red'}`}>
                        {log.success ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

        </div>{/* /mem-content */}
      </main>
    </div>
  )
}