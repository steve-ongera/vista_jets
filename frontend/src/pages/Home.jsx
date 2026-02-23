import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAircraft, getYachts } from '../services/api'

const STATS = [
  { value: '187', label: 'Countries Served', icon: 'bi-globe2' },
  { value: '2,400+', label: 'Aircraft Available', icon: 'bi-airplane' },
  { value: '24/7', label: 'Concierge Access', icon: 'bi-headset' },
  { value: '< 4hrs', label: 'Avg Response Time', icon: 'bi-clock' },
]

const SERVICES = [
  {
    icon: 'bi-airplane',
    title: 'Private Jet Charter',
    tagline: 'Airport to airport, worldwide',
    description: 'Book a private jet from any airport to any destination worldwide. Whether you need a light jet for a regional hop or an ultra-long-range aircraft for intercontinental travel, our team finds the right aircraft at the right price — instantly.',
    link: '/book-flight',
    cta: 'Book a Flight',
  },
  {
    icon: 'bi-water',
    title: 'Superyacht Charter',
    tagline: 'Mediterranean, Caribbean & beyond',
    description: 'Charter a superyacht for a weekend, a week, or the entire season. From intimate sailing yachts to 130-metre flagship vessels, our fleet covers every ocean. Full crew, bespoke itineraries, and world-class provisioning included.',
    link: '/yacht-charter',
    cta: 'Charter a Yacht',
  },
  {
    icon: 'bi-file-earmark-text',
    title: 'Long-Term Leasing',
    tagline: 'Dedicated aircraft & yacht programs',
    description: 'For frequent travellers and corporations, a dedicated lease offers unmatched availability and significant cost savings over ad-hoc charter. Monthly, quarterly, and multi-year programs available for aircraft and yachts.',
    link: '/leasing',
    cta: 'Explore Leasing',
  },
  {
    icon: 'bi-send',
    title: 'Flight Inquiry',
    tagline: 'Explore options, no commitment',
    description: "Not sure of your dates or route? Send a general inquiry and one of our aviation specialists will design the perfect itinerary for you. We'll present aircraft options, pricing estimates, and routing alternatives within hours.",
    link: '/flight-inquiry',
    cta: 'Send Inquiry',
  },
]

const WHY_US = [
  { icon: 'bi-shield-check', title: 'ARGUS Platinum Rated', desc: 'Every operator in our network holds the highest safety certification in private aviation. Your safety is never compromised.' },
  { icon: 'bi-person-check', title: 'No Account Required', desc: 'Submit a booking request in minutes with no registration, no membership fee, and no subscription. Luxury without the friction.' },
  { icon: 'bi-cash-coin', title: 'Transparent Pricing', desc: 'No hidden fees, no fuel surcharge surprises. The price you are quoted is the price you pay — with full breakdown provided.' },
  { icon: 'bi-headset', title: '24 / 7 Concierge', desc: "Our team doesn't sleep. Available around the clock by phone, email, or WhatsApp in English, French, Arabic, and Mandarin." },
  { icon: 'bi-geo-alt', title: 'Remote Destinations', desc: 'We access airports others can\'t — private strips, short runways, high-altitude destinations. The world is genuinely open to you.' },
  { icon: 'bi-star', title: 'Tailored Experience', desc: 'From in-flight catering curated by Michelin-starred chefs to seamless ground transport and hotel coordination — every detail attended to.' },
]

const PROCESS = [
  { step: '01', icon: 'bi-pencil-square', title: 'Submit Your Request', desc: 'Tell us your route, dates, and passenger count using our simple booking form. Takes under three minutes with no account needed.' },
  { step: '02', icon: 'bi-envelope-check', title: 'Receive Your Quote', desc: 'Our specialists review available aircraft and present a tailored quote within two to four hours, complete with aircraft specifications and pricing.' },
  { step: '03', icon: 'bi-airplane-fill', title: 'Fly in Absolute Comfort', desc: 'Confirm your booking and relax. We handle all logistics — from ground transport to in-flight dining preferences and beyond.' },
]

export default function Home() {
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts]   = useState([])

  useEffect(() => {
    getAircraft().then(d => setAircraft((d.results || d).slice(0, 3))).catch(() => {})
    getYachts().then(d => setYachts((d.results || d).slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80)` }}
        />
        <div className="hero-overlay" />
        <div className="container" style={{ width: '100%' }}>
          <div className="hero-content fade-up">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              <i className="bi bi-airplane" /> Private Aviation & Yacht Charter
            </span>
            <h1>The World Is Your<br /><em>Runway</em></h1>
            <p>
              Instant access to 2,400+ private aircraft and 800+ yachts in 187 countries.
              No membership. No waiting. Just seamless luxury travel tailored to you.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/book-flight" className="btn btn-gold btn-lg fade-up delay-1">
                <i className="bi bi-airplane" /> Book a Flight
              </Link>
              <Link to="/flight-inquiry" className="btn btn-white btn-lg fade-up delay-2">
                <i className="bi bi-send" /> General Inquiry
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2, animation: 'fadeUp 1s ease 1s forwards', opacity: 0 }}>
          <i className="bi bi-chevron-double-down" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }} />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="grid-4">
            {STATS.map(({ value, label, icon }) => (
              <div className="stat-item" key={label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                  <div className="stat-value">{value}</div>
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">What We Offer</span>
            <h2>Luxury Travel, <em>Simplified</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 540, margin: '0 auto', fontSize: '1rem' }}>
              From a single flight to a season-long yacht charter or a multi-year aircraft lease, 
              VistaJets gives you direct access to the world's finest private travel assets — 
              without the complexity.
            </p>
          </div>

          <div className="grid-4" style={{ marginTop: '3rem' }}>
            {SERVICES.map(({ icon, title, tagline, description, link, cta }) => (
              <div className="card" key={title} style={{ padding: '2rem' }}>
                <div style={{
                  width: 52, height: 52, background: 'var(--gold-pale)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
                </div>
                <h4 style={{ marginBottom: '0.25rem' }}>{title}</h4>
                <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.02em' }}>{tagline}</div>
                <p style={{ fontSize: '0.855rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>{description}</p>
                <Link to={link} className="btn btn-outline-navy btn-sm">
                  {cta} <i className="bi bi-arrow-right" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Aircraft ─────────────────────────────────────────────── */}
      {aircraft.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <div>
                <span className="eyebrow">Private Jet Fleet</span>
                <h2>Aircraft for Every <em>Mission</em></h2>
                <div className="gold-rule" />
                <p style={{ maxWidth: 500 }}>
                  From nimble light jets perfect for European city hops to ultra-long-range flagships 
                  that connect New York to Singapore nonstop — our fleet covers every range, 
                  cabin size, and budget.
                </p>
              </div>
              <Link to="/fleet" className="btn btn-outline-navy">
                View Full Fleet <i className="bi bi-arrow-right" />
              </Link>
            </div>

            <div className="grid-3">
              {aircraft.map(ac => (
                <div className="card" key={ac.id}>
                  {ac.image_url
                    ? <img src={ac.image_url} alt={ac.name} className="card-img" />
                    : <div className="card-img-placeholder"><i className="bi bi-airplane" /></div>
                  }
                  <div className="card-body">
                    <span className="card-tag">{ac.category_display}</span>
                    <div className="card-title">{ac.name}</div>
                    <div className="card-meta">
                      <i className="bi bi-people" style={{ marginRight: 5 }} />{ac.passenger_capacity} passengers
                      <span style={{ margin: '0 8px', color: 'var(--gray-200)' }}>·</span>
                      <i className="bi bi-arrow-left-right" style={{ marginRight: 5 }} />{ac.range_km?.toLocaleString()} km range
                    </div>
                    <div className="card-actions">
                      <Link to="/book-flight" className="btn btn-navy btn-sm">Book</Link>
                      <Link to="/leasing" className="btn btn-outline-navy btn-sm">Lease</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why VistaJets ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">Why VistaJets</span>
            <h2>The Standard Others <em>Aspire To</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 520, margin: '0 auto' }}>
              With over 20 years serving heads of state, Fortune 500 executives, and discerning 
              private travellers, VistaJets has perfected what private travel should feel like.
            </p>
          </div>
          <div className="grid-3" style={{ marginTop: '3rem' }}>
            {WHY_US.map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                <div style={{ flexShrink: 0, width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Yacht Charter CTA ─────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', padding: '7rem 0', overflow: 'hidden',
        backgroundImage: `url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,29,58,0.88) 0%, rgba(11,29,58,0.55) 100%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
            <i className="bi bi-water" /> Superyacht Charter
          </span>
          <h2 style={{ color: 'var(--white)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            Set Sail on the <em style={{ color: 'var(--gold-light)' }}>World's Finest</em> Yachts
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto 2.5rem', fontSize: '1rem', lineHeight: 1.8 }}>
            From the turquoise waters of the Maldives to the dramatic fjords of Norway, 
            our superyacht fleet takes you to places only accessible by sea. 
            Fully crewed, provisioned, and ready to sail on your schedule.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/yacht-charter" className="btn btn-gold btn-lg">
              <i className="bi bi-water" /> Charter a Yacht
            </Link>
            <Link to="/fleet" className="btn btn-outline-gold btn-lg" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}>
              Browse Yachts
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">The VistaJets Process</span>
            <h2>From Request to <em>Takeoff</em> in Three Steps</h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 500, margin: '0 auto' }}>
              We've eliminated every unnecessary step. Our booking process is designed for 
              busy people who value their time as much as their comfort.
            </p>
          </div>
          <div className="grid-3" style={{ marginTop: '3.5rem' }}>
            {PROCESS.map(({ step, icon, title, desc }) => (
              <div key={step} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <div style={{ width: 72, height: 72, background: 'var(--navy)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <i className={`bi ${icon}`} style={{ fontSize: '1.6rem', color: 'var(--gold)' }} />
                  </div>
                  <span style={{ position: 'absolute', top: -6, right: -10, fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-pale)', padding: '1px 6px', borderRadius: 4 }}>{step}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/book-flight" className="btn btn-navy btn-lg">
              <i className="bi bi-airplane" /> Begin Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Yachts ───────────────────────────────────────────────── */}
      {yachts.length > 0 && (
        <section className="section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
              <div>
                <span className="eyebrow">Superyacht Fleet</span>
                <h2>Vessels Built for <em>Extraordinary</em> Voyages</h2>
                <div className="gold-rule" />
              </div>
              <Link to="/fleet" className="btn btn-outline-navy">View All Yachts <i className="bi bi-arrow-right" /></Link>
            </div>
            <div className="grid-3">
              {yachts.map(y => (
                <div className="card" key={y.id}>
                  {y.image_url
                    ? <img src={y.image_url} alt={y.name} className="card-img" />
                    : <div className="card-img-placeholder"><i className="bi bi-water" /></div>
                  }
                  <div className="card-body">
                    <span className="card-tag">{y.size_display}</span>
                    <div className="card-title">{y.name}</div>
                    <div className="card-meta">
                      {y.length_meters}m &nbsp;·&nbsp; {y.guest_capacity} guests &nbsp;·&nbsp; {y.crew_count} crew
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem' }}>
                      From ${parseInt(y.daily_rate_usd).toLocaleString()}<span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.78rem' }}>/day</span>
                    </div>
                    <div className="card-actions">
                      <Link to="/yacht-charter" className="btn btn-navy btn-sm">Charter</Link>
                      <Link to="/leasing" className="btn btn-outline-navy btn-sm">Lease</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--navy)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Ready to Fly?</span>
          <h2 style={{ color: 'var(--white)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            Your Private Jet is <em style={{ color: 'var(--gold-light)' }}>Waiting</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem', fontSize: '1rem' }}>
            Whether you're flying solo or bringing an entire team, VistaJets has the right aircraft
            at the right price. Our concierge team is standing by 24 hours a day, seven days a week.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book-flight" className="btn btn-gold btn-lg">
              <i className="bi bi-airplane" /> Book a Flight
            </Link>
            <Link to="/flight-inquiry" className="btn btn-outline-gold btn-lg" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
              <i className="bi bi-send" /> Send an Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}