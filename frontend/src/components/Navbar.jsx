import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/fleet',           label: 'Our Fleet',       icon: 'bi-grid-3x3-gap' },
  { to: '/book-flight',     label: 'Book a Flight',   icon: 'bi-airplane' },
  { to: '/flight-inquiry',  label: 'Flight Inquiry',  icon: 'bi-send' },
  { to: '/yacht-charter',   label: 'Yacht Charter',   icon: 'bi-water' },
  { to: '/leasing',         label: 'Leasing',         icon: 'bi-file-earmark-text' },
  { to: '/track',           label: 'Track Booking',   icon: 'bi-search' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => setDrawerOpen(false), [location])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isActive = (to) => location.pathname === to

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">Vista<span>Jets</span></Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            {NAV_LINKS.slice(0, 5).map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={[
                    isActive(to) ? 'active' : '',
                    to === '/book-flight' ? 'navbar-cta-btn' : '',
                  ].join(' ').trim()}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/track" className={isActive('/track') ? 'active' : ''}>
                <i className="bi bi-search" style={{ fontSize: '0.85rem' }} />
              </Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button className="navbar-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <i className="bi bi-list" />
          </button>
        </div>
      </nav>

      {/* ── Drawer Overlay ── */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Right Drawer ── */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-modal="true" role="dialog">
        <div className="drawer-header">
          <span className="drawer-logo">Vista<span>Jets</span></span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="drawer-nav">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={isActive(to) ? 'active' : ''}
            >
              <i className={`bi ${icon}`} />
              {label}
            </Link>
          ))}
          <div className="drawer-divider" />
          <a href="tel:+18005478538">
            <i className="bi bi-telephone" />
            +1 (800) 547-8538
          </a>
          <a href="mailto:concierge@vistajets.com">
            <i className="bi bi-envelope" />
            concierge@vistajets.com
          </a>
        </nav>

        <div className="drawer-footer">
          <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>
            No account required. Our team is available 24 / 7.
          </p>
          <Link to="/book-flight" className="btn btn-navy btn-lg drawer-footer-book">
            <i className="bi bi-airplane" />
            Book a Flight
          </Link>
        </div>
      </aside>
    </>
  )
}