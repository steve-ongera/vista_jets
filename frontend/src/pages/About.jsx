// src/pages/About.jsx
export default function About() {
  const LEADERSHIP = [
    { name: 'Alexander Mercer', title: 'Chief Executive Officer', bio: 'Former VP at NetJets with 22 years in private aviation. Has overseen 40,000+ flights across 6 continents.', initials: 'AM' },
    { name: 'Sophie Laurent', title: 'Chief Operations Officer', bio: 'Ex-Air France operations director. Built and manages our 24/7 global dispatch and concierge infrastructure.', initials: 'SL' },
    { name: 'James Okonkwo', title: 'Head of Fleet Acquisitions', bio: 'Type-rated on 14 aircraft types. Oversees safety audits and operator vetting for all 2,400+ aircraft in our network.', initials: 'JO' },
    { name: 'Priya Mehta', title: 'Director of Client Experience', bio: 'Pioneered our white-glove concierge program. Former luxury hospitality lead at Four Seasons Hotels globally.', initials: 'PM' },
  ]

  const MILESTONES = [
    { year: '2004', event: 'VistaJets founded in Geneva with a fleet of 12 aircraft and a vision for frictionless private travel.' },
    { year: '2008', event: 'Expanded to Middle East and Asia Pacific, establishing regional hubs in Dubai and Singapore.' },
    { year: '2012', event: 'Launched our 24/7 concierge program and became the first private aviation company to offer guaranteed availability.' },
    { year: '2016', event: 'Added superyacht charter to our portfolio, creating the first integrated air & sea luxury travel platform.' },
    { year: '2019', event: 'Surpassed 100,000 flights completed. Opened our dedicated aircraft leasing and sales division.' },
    { year: '2023', event: 'Network grows to 2,400+ aircraft across 187 countries. Launched air cargo and group charter divisions.' },
  ]

  const VALUES = [
    { icon: 'bi-shield-check', title: 'Safety First, Always', desc: 'Every operator in our network is ARGUS Platinum or Wyvern Wingman certified. Our own safety team conducts independent audits — no exceptions, no compromises.' },
    { icon: 'bi-gem', title: 'Relentless Excellence', desc: 'We obsess over every detail of your journey, from the cabin temperature on boarding to the brand of still water at your seat. Excellence is our baseline.' },
    { icon: 'bi-eye', title: 'Complete Transparency', desc: 'No hidden fees. No last-minute surcharges. The price we quote is the price you pay. We publish our pricing model and welcome scrutiny.' },
    { icon: 'bi-globe2', title: 'Truly Global Reach', desc: 'We access destinations others cannot. High-altitude strips, remote island runways, frozen northern airfields. The world is your runway — all of it.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '9rem 0 7rem', backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(11,29,58,0.9) 0%, rgba(11,29,58,0.65) 100%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-building" /> Our Story</span>
          <h1 style={{ color: 'var(--white)', marginTop: '0.5rem', maxWidth: 680 }}>Two Decades of <em style={{ color: 'var(--gold-light)' }}>Defining</em> Private Aviation</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 560, marginTop: '1.25rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
            Founded in Geneva in 2004, VistaJets was born from a simple conviction: private aviation should feel effortless, transparent, and truly global. Twenty years later, that conviction drives everything we do.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Our Mission</span>
              <h2>Private Travel Without the <em>Friction</em></h2>
              <div className="gold-rule" />
              <p style={{ lineHeight: 1.9, marginBottom: '1.25rem' }}>
                We believe that the moment you decide to fly privately, every decision afterward should feel natural and inevitable — not complicated, not anxious, not expensive in unexpected ways.
              </p>
              <p style={{ lineHeight: 1.9, marginBottom: '1.25rem' }}>
                Our mission is to eliminate the opacity that has long defined this industry. We build technology and processes that give you clear pricing, instant access to aircraft, and human support that never sleeps.
              </p>
              <p style={{ lineHeight: 1.9 }}>
                Whether you're a first-time charter customer or a Fortune 500 flight department, you deserve the same standard of care, the same quality of aircraft, and the same level of honest communication.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {[['2,400+','Aircraft in Network'],['187','Countries Served'],['100K+','Flights Completed'],['20','Years of Excellence']].map(([v, l]) => (
                <div key={l} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: '0.5rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">What We Stand For</span>
            <h2>Our Core <em>Values</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-4" style={{ marginTop: '3rem' }}>
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '2rem', background: 'var(--off-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)' }}>
                <div style={{ width: 52, height: 52, background: 'var(--gold-pale)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
                </div>
                <h4 style={{ marginBottom: '0.65rem' }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--navy)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Our Journey</span>
            <h2 style={{ color: 'var(--white)' }}>Twenty Years of <em style={{ color: 'var(--gold-light)' }}>Milestones</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div style={{ maxWidth: 720, margin: '3rem auto 0', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.1)', transform: 'translateX(-50%)' }} />
            {MILESTONES.map(({ year, event }, i) => (
              <div key={year} style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.4rem' }}>{year}</div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.7 }}>{event}</p>
                </div>
                <div style={{ width: 14, height: 14, background: 'var(--gold)', borderRadius: '50%', flexShrink: 0, marginTop: '0.5rem', boxShadow: '0 0 0 4px rgba(196,160,90,0.25)' }} />
                <div style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">The Team</span>
            <h2>Leadership You Can <em>Trust</em></h2>
            <div className="gold-rule gold-rule-center" />
            <p style={{ maxWidth: 540, margin: '0 auto' }}>Our leadership team brings over 150 combined years of aviation, hospitality, and technology experience to every decision we make.</p>
          </div>
          <div className="grid-4" style={{ marginTop: '3rem' }}>
            {LEADERSHIP.map(({ name, title, bio, initials }) => (
              <div key={name} style={{ background: 'var(--off-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-100)' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 70, height: 70, background: 'rgba(196,160,90,0.2)', border: '2px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>{initials}</div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>{name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{title}</div>
                  <p style={{ fontSize: '0.825rem', lineHeight: 1.7, color: 'var(--gray-600)' }}>{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">Safety & Compliance</span>
            <h2>Certified to the <em>Highest Standard</em></h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-4" style={{ marginTop: '2.5rem' }}>
            {[
              { icon: 'bi-patch-check', label: 'ARGUS Platinum', sub: 'Highest charter operator rating' },
              { icon: 'bi-award', label: 'IS-BAO Stage 3', sub: 'International safety standards' },
              { icon: 'bi-shield-fill-check', label: 'Wyvern Wingman', sub: 'Independent safety audits' },
              { icon: 'bi-file-earmark-check', label: 'EASA & FAA', sub: 'Dual regulatory compliance' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
                <i className={`bi ${icon}`} style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1rem', display: 'block' }} />
                <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}