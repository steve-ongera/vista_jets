// src/pages/membership/Plans.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMembershipTiers, subscribeMembership } from '../../services/api'

const TIER_META = {
  basic:     { icon: 'bi-shield',          colour: '#6CB4E4', dark: '#3A8BBE' },
  premium:   { icon: 'bi-star-fill',       colour: '#C9A84C', dark: '#A07830' },
  corporate: { icon: 'bi-building-check',  colour: '#0b1d3a', dark: '#060f1e' },
}

const DEFAULT_FEATURES = {
  basic:     ['Access to standard aircraft listings', 'Up to 10 bookings per month', 'Email support', 'Booking history & saved routes'],
  premium:   ['Priority booking access', 'Exclusive aircraft listings', 'Dedicated support line', 'Unlimited monthly bookings', 'Custom catering options'],
  corporate: ['Corporate account management', 'Multi-passenger group bookings', 'White-glove concierge support', 'Custom pricing negotiation', 'Dedicated fleet options', 'Monthly invoicing available'],
}

export default function Plans() {
  const [tiers, setTiers]     = useState([])
  const [billing, setBilling] = useState('annual')
  const [loading, setLoading] = useState(true)
  const [subbing, setSubbing] = useState(null)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()

  useEffect(() => {
    getMembershipTiers()
      .then(data => setTiers(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('Could not load plans. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const subscribe = async (tierName) => {
    const user = JSON.parse(localStorage.getItem('vj_user') || 'null')
    if (!user) { navigate('/membership/login'); return }
    setSubbing(tierName)
    setError(null)
    try {
      const res = await subscribeMembership({ tier_name: tierName, billing_cycle: billing, auto_renew: true })
      setSuccess(res.message || `Successfully subscribed to ${tierName}!`)
      setTimeout(() => navigate('/membership/dashboard'), 2200)
    } catch (err) {
      setError(err.message || 'Subscription failed. Please try again.')
    } finally {
      setSubbing(null)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', padding: '7rem 0 6rem', backgroundImage: 'url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(11,29,58,0.94) 0%, rgba(11,29,58,0.7) 100%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
            <i className="bi bi-shield-check" /> Membership Plans
          </span>
          <h1 style={{ color: 'var(--white)', marginTop: '0.5rem' }}>
            Fly Private,{' '}
            <em style={{ color: 'var(--gold-light)' }}>Your Way</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 500, margin: '1.25rem auto 0', lineHeight: 1.8 }}>
            Choose the membership that fits your lifestyle. Unlock exclusive aircraft, priority booking, and dedicated support.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: 30, padding: '4px', marginTop: '2rem', gap: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
            {[['monthly', 'Monthly'], ['annual', 'Annual — Save 15%']].map(([v, l]) => (
              <button key={v} onClick={() => setBilling(v)}
                style={{ padding: '0.45rem 1.25rem', borderRadius: 26, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: billing === v ? 'white' : 'transparent', color: billing === v ? 'var(--navy)' : 'rgba(255,255,255,0.65)', transition: 'var(--transition)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">

          {success && (
            <div style={{ background: '#EBF7F1', border: '1px solid #A7D7C5', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'center', color: '#1a8754', fontWeight: 600, fontSize: '0.95rem' }}>
              <i className="bi bi-check-circle-fill" /> {success} — Redirecting to your dashboard…
            </div>
          )}

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'center', color: '#991B1B', fontSize: '0.875rem' }}>
              <i className="bi bi-exclamation-triangle" /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner" /></div>
          ) : (
            <div className="grid-3">
              {tiers.map(tier => {
                const meta    = TIER_META[tier.name] || { icon: 'bi-shield', colour: '#888', dark: '#555' }
                const price   = billing === 'annual' ? tier.annual_fee_usd : tier.monthly_fee_usd
                const features = (tier.features_list && tier.features_list.length > 0)
                  ? tier.features_list
                  : DEFAULT_FEATURES[tier.name] || []
                const isPremium = tier.name === 'premium'

                return (
                  <div key={tier.id}
                    style={{ background: 'var(--white)', border: `2px solid ${isPremium ? 'var(--gold)' : 'var(--gray-100)'}`, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: isPremium ? 'var(--shadow-xl)' : 'var(--shadow-sm)', transform: isPremium ? 'translateY(-8px)' : 'none', position: 'relative' }}>

                    {isPremium && (
                      <div style={{ background: 'var(--gold)', color: 'white', textAlign: 'center', padding: '0.35rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        ★ Most Popular
                      </div>
                    )}

                    {/* Tier header */}
                    <div style={{ background: meta.colour, padding: '2rem 1.5rem' }}>
                      <i className={`bi ${meta.icon}`} style={{ fontSize: '2.2rem', color: 'rgba(255,255,255,0.75)' }} />
                      <h3 style={{ color: 'white', margin: '0.5rem 0 0.25rem', fontSize: '1.4rem' }}>{tier.display_name}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                        {tier.description || `Access the ${tier.display_name} aviation experience.`}
                      </p>
                    </div>

                    <div style={{ padding: '1.75rem 1.5rem' }}>
                      {/* Price */}
                      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.25rem' }}>
                          <span style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                            ${Number(price).toLocaleString()}
                          </span>
                          <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem', paddingBottom: '0.3rem' }}>
                            /{billing === 'annual' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billing === 'annual' && (
                          <div style={{ fontSize: '0.75rem', color: meta.colour, fontWeight: 600, marginTop: '0.3rem' }}>
                            <i className="bi bi-tag" /> 15% saved vs monthly billing
                          </div>
                        )}
                        {tier.hourly_discount_pct > 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.3rem' }}>
                            <i className="bi bi-percent" /> {tier.hourly_discount_pct}% off standard hourly rates
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {features.map((f, i) => (
                          <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                            <i className="bi bi-check-circle-fill" style={{ color: meta.colour, flexShrink: 0, marginTop: '0.1rem' }} />
                            {f}
                          </li>
                        ))}
                        {tier.priority_booking && (
                          <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                            <i className="bi bi-check-circle-fill" style={{ color: meta.colour, flexShrink: 0 }} />
                            Priority booking access
                          </li>
                        )}
                        {tier.dedicated_support && (
                          <li style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                            <i className="bi bi-check-circle-fill" style={{ color: meta.colour, flexShrink: 0 }} />
                            Dedicated support line
                          </li>
                        )}
                      </ul>

                      <button
                        className="btn btn-lg"
                        onClick={() => subscribe(tier.name)}
                        disabled={!!subbing}
                        style={{ width: '100%', justifyContent: 'center', background: meta.colour, color: 'white', border: 'none', opacity: subbing && subbing !== tier.name ? 0.6 : 1 }}
                      >
                        {subbing === tier.name
                          ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Processing…</>
                          : <>Join {tier.display_name} <i className="bi bi-arrow-right" /></>}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Guarantee */}
          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                ['bi-shield-check',  'Secure Payments',    'All transactions encrypted & protected'],
                ['bi-arrow-repeat',  'Auto-Renewal',       'Cancel anytime, no hidden fees'],
                ['bi-headset',       '24/7 Support',       'Our team is always available'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                  <i className={`bi ${icon}`} style={{ fontSize: '1.5rem', color: 'var(--gold)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)' }}>{title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
