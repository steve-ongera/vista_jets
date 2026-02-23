import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAircraft, getYachts } from '../services/api'

const SERVICES = [
  {
    icon: '✈',
    title: 'Private Jets',
    description: 'Airport to airport bookings with immediate confirmation. Light jets to VIP airliners — any route, any time.',
    link: '/book-flight',
    cta: 'Book Now',
  },
  {
    icon: '⚓',
    title: 'Yacht Charter',
    description: 'Superyachts and expedition vessels for Mediterranean, Caribbean, and beyond. Crewed and provisioned.',
    link: '/yacht-charter',
    cta: 'Charter',
  },
  {
    icon: '📋',
    title: 'Leasing',
    description: 'Dedicated aircraft or yacht on long-term lease. Monthly, quarterly, or annual programs tailored to you.',
    link: '/leasing',
    cta: 'Inquire',
  },
  {
    icon: '✉',
    title: 'Flight Inquiry',
    description: 'Not sure of dates? Exploring options? Submit a general inquiry and a specialist will guide you.',
    link: '/flight-inquiry',
    cta: 'Inquire',
  },
]

const STATS = [
  { value: '187', label: 'Countries Served' },
  { value: '2,400+', label: 'Aircraft Available' },
  { value: '24/7', label: 'Concierge Access' },
  { value: '< 4h', label: 'Avg Response Time' },
]

export default function Home() {
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts] = useState([])

  useEffect(() => {
    getAircraft().then(d => setAircraft((d.results || d).slice(0, 3))).catch(() => {})
    getYachts().then(d => setYachts((d.results || d).slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80)`,
        }} />
        {/* Gold gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(201,168,76,0.05) 100%)',
        }} />
        <div className="hero-content fade-up">
          <span className="section-label">Private Aviation & Maritime</span>
          <h1 style={{ color: 'var(--white)', marginBottom: '1.5rem' }}>
            The World<br /><em style={{ color: 'var(--gold)' }}>Awaits You</em>
          </h1>
          <p style={{ fontSize: '1rem', maxWidth: 480, marginBottom: '2.5rem', color: 'var(--ivory-dim)', lineHeight: 1.8 }}>
            Instant access to private jets and superyachts worldwide. 
            No membership. No waiting. Just seamless luxury travel.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/book-flight" className="btn btn-primary">Book a Flight</Link>
            <Link to="/flight-inquiry" className="btn btn-outline">General Inquiry</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeUp 1s ease 0.8s forwards', opacity: 0,
        }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gold)' }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'var(--gold)', animation: 'scrollLine 2s ease infinite' }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--charcoal)', borderBottom: '1px solid var(--ash)', padding: '3rem 0' }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>{value}</div>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ivory-dim)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <span className="section-label">What We Offer</span>
            <h2>Total Luxury, <em>Zero Barriers</em></h2>
            <div className="divider divider-center" />
            <p style={{ maxWidth: 500, margin: '0 auto' }}>
              No account required. Request any service and our concierge team handles everything.
            </p>
          </div>
          <div className="grid-4">
            {SERVICES.map(({ icon, title, description, link, cta }) => (
              <div key={title} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--ivory)' }}>{title}</h3>
                <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>{description}</p>
                <Link to={link} className="btn btn-outline" style={{ fontSize: '0.7rem' }}>{cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Aircraft ── */}
      {aircraft.length > 0 && (
        <section className="section" style={{ background: 'var(--charcoal)' }}>
          <div className="container">
            <div className="section-title">
              <span className="section-label">Our Fleet</span>
              <h2>Aircraft for Every <em>Journey</em></h2>
              <div className="divider divider-center" />
            </div>
            <div className="grid-3">
              {aircraft.map(ac => (
                <div key={ac.id} className="card">
                  {ac.image_url && <img src={ac.image_url} alt={ac.name} className="card-image" />}
                  <div className="card-body">
                    <span className="card-tag">{ac.category_display}</span>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{ac.name}</h3>
                    <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                      {ac.passenger_capacity} passengers · {ac.range_km?.toLocaleString()} km range
                    </p>
                    <Link to="/book-flight" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem' }}>
                      Request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/fleet" className="btn btn-ghost">View Full Fleet</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Yacht CTA ── */}
      <section style={{
        position: 'relative', padding: '8rem 3rem', overflow: 'hidden',
        backgroundImage: `url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="section-label">Maritime Charter</span>
          <h2 style={{ color: 'var(--white)', marginBottom: '1.5rem' }}>
            Explore the <em style={{ color: 'var(--gold)' }}>Open Sea</em>
          </h2>
          <p style={{ maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            From intimate sailing yachts to 90m superyachts. Charter by the day, week, or season — 
            with full crew and bespoke itineraries.
          </p>
          <Link to="/yacht-charter" className="btn btn-primary">Charter a Yacht</Link>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <span className="section-label">How It Works</span>
            <h2>Three Steps to <em>Takeoff</em></h2>
            <div className="divider divider-center" />
          </div>
          <div className="grid-3" style={{ textAlign: 'center' }}>
            {[
              { step: '01', title: 'Submit Request', desc: 'Fill out your flight details — no account or sign-up required.' },
              { step: '02', title: 'Receive Quote', desc: 'Our team reviews your request and sends a tailored quote within hours.' },
              { step: '03', title: 'Fly in Style', desc: 'Confirm your booking and leave the rest to our concierge team.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 300,
                  color: 'var(--gold)', opacity: 0.4, marginBottom: '1rem',
                }}>{step}</div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </div>
  )
}