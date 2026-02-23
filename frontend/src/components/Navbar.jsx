import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const links = [
    { to: '/fleet', label: 'Fleet' },
    { to: '/book-flight', label: 'Book Flight' },
    { to: '/flight-inquiry', label: 'Inquire' },
    { to: '/yacht-charter', label: 'Yacht Charter' },
    { to: '/leasing', label: 'Leasing' },
    { to: '/track', label: 'Track' },
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar-logo">
        VISTA<span>JETS</span>
      </Link>

      {/* Desktop nav */}
      <ul className="navbar-links" style={{ display: menuOpen ? 'none' : undefined }}>
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={to === '/book-flight' ? 'navbar-cta' : ''}
              style={{ color: location.pathname === to ? 'var(--gold)' : undefined }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--ivory)',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
        className="mobile-menu-btn"
        aria-label="Menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--obsidian)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
        }}>
          <button onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'none', border: 'none', color: 'var(--ivory)',
            fontSize: '1.5rem', cursor: 'pointer',
          }}>✕</button>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: location.pathname === to ? 'var(--gold)' : 'var(--ivory)',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .navbar-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}