// ── Updated Navbar.jsx — with Membership link and auth state ──────────────────
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearTokens } from '../services/api'

const PRIMARY_LINKS = [
  { to: '/book-flight',    label: 'Private Jet Charter',  icon: 'bi-airplane',    cta: true },
  { to: '/fleet',          label: 'Our Fleet',      icon: 'bi-grid-3x3-gap' },
  { to: '/yacht-charter',  label: 'Yacht Charter',  icon: 'bi-water' },
  { to: '/flight-inquiry', label: 'Flight Inquiry', icon: 'bi-send' },
  { to: '/contact',        label: 'Contact Us',     icon: 'bi-envelope' },
]

const SERVICE_LINKS = [
  { to: '/group-charter',  label: 'Group Charter',  icon: 'bi-people',            desc: 'Travel for teams, events & delegations' },
  { to: '/air-cargo',      label: 'Air Cargo',      icon: 'bi-boxes',             desc: 'Time-critical & specialist freight' },
  { to: '/aircraft-sales', label: 'Aircraft Sales', icon: 'bi-tag',               desc: 'Buy, sell or trade private aircraft' },
  { to: '/leasing',        label: 'Leasing',        icon: 'bi-file-earmark-text', desc: 'Dedicated aircraft & yacht programs' },
]

const ALL_LINKS = [
  { to: '/book-flight',    label: 'Book a Flight',  icon: 'bi-airplane' },
  { to: '/fleet',          label: 'Our Fleet',      icon: 'bi-grid-3x3-gap' },
  { to: '/flight-inquiry', label: 'Flight Inquiry', icon: 'bi-send' },
  { to: '/yacht-charter',  label: 'Yacht Charter',  icon: 'bi-water' },
  { to: '/contact',        label: 'Contact Us',     icon: 'bi-envelope' },
  { to: '/about',          label: 'About Us',       icon: 'bi-building' },
  { to: '/track',          label: 'Track Booking',  icon: 'bi-search' },
]

const ALL_SERVICE_LINKS = [
  { to: '/group-charter',  label: 'Group Charter',  icon: 'bi-people' },
  { to: '/air-cargo',      label: 'Air Cargo',      icon: 'bi-boxes' },
  { to: '/aircraft-sales', label: 'Aircraft Sales', icon: 'bi-tag' },
  { to: '/leasing',        label: 'Leasing',        icon: 'bi-file-earmark-text' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moreOpen, setMoreOpen]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser]             = useState(null)
  const location                    = useLocation()
  const navigate                    = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false); setMoreOpen(false); setUserMenuOpen(false)
    // Read user from localStorage on route change
    const stored = localStorage.getItem('vj_user')
    setUser(stored ? JSON.parse(stored) : null)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isActive = (to) => location.pathname === to

  const handleLogout = () => {
    clearTokens()
    setUser(null)
    navigate('/')
  }

  const dashboardPath = user?.role === 'owner' ? '/membership/owner-dashboard'
                      : user?.role === 'admin' ? '/membership/admin-dashboard'
                      : '/membership/dashboard'

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">Nairobi<span>JetHouse</span></Link>

          <ul className="navbar-links">
            {PRIMARY_LINKS.map(({ to, label, cta }) => (
              <li key={to}>
                <Link to={to} className={[isActive(to) ? 'active' : '', cta ? 'navbar-cta-btn' : ''].join(' ').trim()}>
                  {label}
                </Link>
              </li>
            ))}

            {/* Services dropdown */}
            <li style={{ position: 'relative' }}>
              <button onClick={() => setMoreOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 500, color: moreOpen ? 'var(--gold)' : 'inherit', padding: '0.25rem 0', transition: 'var(--transition)' }}>
                Services&nbsp;<i className={`bi bi-chevron-${moreOpen ? 'up' : 'down'}`} style={{ fontSize: '0.68rem' }} />
              </button>
              {moreOpen && (
                <>
                  <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 498 }} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 0.8rem)', right: '-0.5rem', zIndex: 499, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', width: 280, overflow: 'hidden' }}>
                    <div style={{ padding: '0.65rem 1.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)' }}>Specialist Services</div>
                    {SERVICE_LINKS.map(({ to, label, icon, desc }) => (
                      <Link key={to} to={to}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.75rem 1.1rem', textDecoration: 'none', background: isActive(to) ? 'var(--gray-50)' : 'transparent', borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = isActive(to) ? 'var(--gray-50)' : 'transparent'}>
                        <div style={{ width: 34, height: 34, background: 'var(--gold-pale)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '0.95rem' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isActive(to) ? 'var(--navy)' : 'var(--gray-800)', marginBottom: '0.2rem' }}>{label}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)' }}>{desc}</div>
                        </div>
                      </Link>
                    ))}
                    <div style={{ padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link to="/about" style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bi bi-building" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> About Us
                      </Link>
                      <Link to="/track" style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bi bi-search" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> Track Booking
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </li>

            {/* ── Membership / User ── */}
            <li style={{ position: 'relative' }}>
              {user ? (
                <>
                  <button onClick={() => setUserMenuOpen(o => !o)}
                    style={{ background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.7rem', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', transition: 'var(--transition)' }}>
                    <i className="bi bi-person-circle" style={{ fontSize: '1rem' }} />
                    {user.first_name || user.username}
                    <i className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem' }} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 498 }} />
                      <div style={{ position: 'absolute', top: 'calc(100% + 0.8rem)', right: 0, zIndex: 499, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', minWidth: 190, overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)' }}>{user.first_name} {user.last_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{user.email}</div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--gold-pale)', color: 'var(--gold)', padding: '1px 8px', borderRadius: 10, marginTop: '0.3rem', display: 'inline-block', textTransform: 'uppercase' }}>{user.role}</span>
                        </div>
                        {[
                          { to: dashboardPath,         icon: 'bi-speedometer2', label: 'Dashboard' },
                          { to: '/membership/bookings',icon: 'bi-calendar3',    label: 'My Bookings' },
                          { to: '/membership/plans',   icon: 'bi-shield-check', label: 'Membership' },
                        ].map(({ to, icon, label }) => (
                          <Link key={to} to={to}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', textDecoration: 'none', fontSize: '0.85rem', color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />{label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#DC2626', textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <i className="bi bi-box-arrow-right" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link to="/membership/login"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.85rem', border: '1.5px solid var(--navy)', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', textDecoration: 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--navy)' }}>
                  <i className="bi bi-person" /> Member Login
                </Link>
              )}
            </li>
          </ul>

          <button className="navbar-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" />
          </button>
        </div>
      </nav>

      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-modal="true" role="dialog">
        <div className="drawer-header">
          <span className="drawer-logo">Nairobi<span>JetHouse</span></span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <nav className="drawer-nav">
          {ALL_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}><i className={`bi ${icon}`} />{label}</Link>
          ))}
          <div className="drawer-divider" />
          <div style={{ padding: '0.35rem 1.25rem 0.2rem', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Services</div>
          {ALL_SERVICE_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}><i className={`bi ${icon}`} />{label}</Link>
          ))}
          <div className="drawer-divider" />
          {/* Membership in drawer */}
          {user ? (
            <>
              <Link to={dashboardPath}><i className="bi bi-speedometer2" />Dashboard</Link>
              <Link to="/membership/bookings"><i className="bi bi-calendar3" />My Bookings</Link>
              <Link to="/membership/plans"><i className="bi bi-shield-check" />Membership</Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1.25rem', color: '#DC2626', fontSize: '0.9rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                <i className="bi bi-box-arrow-right" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/membership/login"><i className="bi bi-person" />Member Login</Link>
              <Link to="/membership/register"><i className="bi bi-person-plus" />Join Now</Link>
              <Link to="/membership/plans"><i className="bi bi-shield-check" />View Plans</Link>
            </>
          )}
          <div className="drawer-divider" />
          <a href="tel:+18005478538"><i className="bi bi-telephone" />+1 (800) 547-8538</a>
          <a href="mailto:concierge@NairobiJetHouse.com"><i className="bi bi-envelope" />concierge@NairobiJetHouse.com</a>
        </nav>
        <div className="drawer-footer">
          <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>No account required. Our team is available 24 / 7.</p>
          <Link to="/book-flight" className="btn btn-navy btn-lg drawer-footer-book"><i className="bi bi-airplane" /> Private Charter</Link>
        </div>
      </aside>
    </>
  )
}