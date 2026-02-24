// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

// ── The 5 most-clicked tabs shown directly in the bar ─────────────────────────
const PRIMARY_LINKS = [
  { to: '/book-flight',   label: 'Book a Flight', icon: 'bi-airplane',    cta: true },
  { to: '/fleet',         label: 'Our Fleet',     icon: 'bi-grid-3x3-gap' },
  { to: '/yacht-charter', label: 'Yacht Charter', icon: 'bi-water' },
  { to: '/contact',       label: 'Contact Us',    icon: 'bi-envelope' },
]

// ── "Services" dropdown — specialist / less-frequent pages ────────────────────
const SERVICE_LINKS = [
  { to: '/group-charter',  label: 'Group Charter',  icon: 'bi-people',            desc: 'Travel for teams, events & delegations' },
  { to: '/air-cargo',      label: 'Air Cargo',      icon: 'bi-boxes',             desc: 'Time-critical & specialist freight' },
  { to: '/aircraft-sales', label: 'Aircraft Sales', icon: 'bi-tag',               desc: 'Buy, sell or trade private aircraft' },
  { to: '/leasing',        label: 'Leasing',        icon: 'bi-file-earmark-text', desc: 'Dedicated aircraft & yacht programs' },
]

// ── Full drawer list (mobile) ─────────────────────────────────────────────────
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
  const location                    = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setDrawerOpen(false); setMoreOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isActive = (to) => location.pathname === to

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">Vista<span>Jets</span></Link>

          {/* Desktop link bar */}
          <ul className="navbar-links">

            {/* Primary tabs */}
            {PRIMARY_LINKS.map(({ to, label, cta }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={[
                    isActive(to) ? 'active' : '',
                    cta ? 'navbar-cta-btn' : '',
                  ].join(' ').trim()}
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* Services dropdown */}
            <li style={{ position: 'relative' }}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 500,
                  color: moreOpen ? 'var(--gold)' : 'inherit',
                  padding: '0.25rem 0', transition: 'var(--transition)',
                }}
              >
                Services&nbsp;<i className={`bi bi-chevron-${moreOpen ? 'up' : 'down'}`} style={{ fontSize: '0.68rem' }} />
              </button>

              {moreOpen && (
                <>
                  {/* click-outside trap */}
                  <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 498 }} />

                  {/* Dropdown panel */}
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 0.8rem)', right: '-0.5rem',
                    zIndex: 499, background: 'var(--white)',
                    border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)', width: 280, overflow: 'hidden',
                  }}>
                    {/* Header label */}
                    <div style={{ padding: '0.65rem 1.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)' }}>
                      Specialist Services
                    </div>

                    {SERVICE_LINKS.map(({ to, label, icon, desc }) => (
                      <Link key={to} to={to}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                          padding: '0.75rem 1.1rem', textDecoration: 'none',
                          background: isActive(to) ? 'var(--gray-50)' : 'transparent',
                          borderBottom: '1px solid var(--gray-100)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = isActive(to) ? 'var(--gray-50)' : 'transparent'}
                      >
                        {/* Icon bubble */}
                        <div style={{ width: 34, height: 34, background: 'var(--gold-pale)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '0.95rem' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isActive(to) ? 'var(--navy)' : 'var(--gray-800)', lineHeight: 1.2, marginBottom: '0.2rem' }}>{label}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', lineHeight: 1.4 }}>{desc}</div>
                        </div>
                      </Link>
                    ))}

                    {/* Footer shortcut */}
                    <div style={{ padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link to="/flight-inquiry" style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bi bi-send" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> Flight Inquiry
                      </Link>
                      <Link to="/about" style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bi bi-building" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> About Us
                      </Link>
                      <Link to="/track" style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bi bi-search" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} /> Track
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </li>

          </ul>

          {/* Mobile hamburger */}
          <button className="navbar-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" />
          </button>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* ── Mobile Drawer ── */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-modal="true" role="dialog">
        <div className="drawer-header">
          <span className="drawer-logo">Vista<span>Jets</span></span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="drawer-nav">
          {/* Main pages */}
          {ALL_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              <i className={`bi ${icon}`} />{label}
            </Link>
          ))}

          {/* Services section */}
          <div className="drawer-divider" />
          <div style={{ padding: '0.35rem 1.25rem 0.2rem', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
            Services
          </div>
          {ALL_SERVICE_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              <i className={`bi ${icon}`} />{label}
            </Link>
          ))}

          <div className="drawer-divider" />
          <a href="tel:+18005478538"><i className="bi bi-telephone" />+1 (800) 547-8538</a>
          <a href="mailto:concierge@vistajets.com"><i className="bi bi-envelope" />concierge@vistajets.com</a>
        </nav>

        <div className="drawer-footer">
          <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>
            No account required. Our team is available 24 / 7.
          </p>
          <Link to="/book-flight" className="btn btn-navy btn-lg drawer-footer-book">
            <i className="bi bi-airplane" /> Book a Flight
          </Link>
        </div>
      </aside>
    </>
  )
}