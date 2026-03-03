// src/pages/Contact.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { createContactInquiry } from '../services/api'

/* ─── SEO Structured Data ────────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NairobiJetHouse',
  url: 'https://www.nairobijethouse.com',
  logo: 'https://www.nairobijethouse.com/nairobi_jh_logo.webp',
  description: 'Private jet charters and superyacht charters worldwide. Based in Nairobi, Kenya, with 24/7 concierge service.',
  telephone: '+254724878136',
  email: 'nairobijethouse@gmail.com',
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: 'Wilson Airport, Langata Road',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
      name: 'Wilson Airport Office',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: 'Jomo Kenyatta International Airport, Airport North Rd',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
      name: 'JKIA Office',
    },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+254724878136',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
    { '@type': 'ContactPoint', email: 'nairobijethouse@gmail.com', contactType: 'customer support' },
    { '@type': 'ContactPoint', email: 'careers@nairobijethouse.com', contactType: 'Human Resources' },
  ],
  sameAs: ['https://wa.me/254724878136'],
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const OFFICES = [
  {
    city: 'Wilson Airport',
    address: 'Wilson Airport, Langata Road, Nairobi, Kenya',
    phone: '+254 724 878 136',
    flag: '🇰🇪',
  },
  {
    city: 'JKIA',
    address: 'Jomo Kenyatta International Airport, Airport North Rd, Nairobi, Kenya',
    phone: '+254 724 878 136',
    flag: '🇰🇪',
  },
]

const SUBJECT_OPTIONS = [
  { value: 'general',     label: 'General Inquiry' },
  { value: 'support',     label: 'Customer Support' },
  { value: 'media',       label: 'Media & Press' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'careers',     label: 'Careers' },
  { value: 'other',       label: 'Other' },
]

export default function Contact() {
  const blank = () => ({ full_name: '', email: '', phone: '', company: '', subject: 'general', message: '' })
  const [form, setForm] = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await createContactInquiry(form)
      setSuccess(res)
    } catch (err) {
      setError(err?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <>
      {/* ── SEO Head ──────────────────────────────────────────────────────── */}
      <Helmet>
        <title>Contact Us | NairobiJetHouse — Private Jet & Yacht Charter Kenya</title>
        <meta name="description" content="Contact NairobiJetHouse 24/7 for private jet charters and superyacht bookings. Offices at Wilson Airport and JKIA, Nairobi. Call +254 724 878 136 or email us." />
        <meta name="keywords" content="contact NairobiJetHouse, private jet charter Nairobi, yacht charter Kenya, Wilson Airport charter, JKIA private aviation, luxury travel Kenya" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/contact" />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://www.nairobijethouse.com/contact" />
        <meta property="og:title"       content="Contact NairobiJetHouse | Private Jet & Yacht Charter" />
        <meta property="og:description" content="Reach our 24/7 concierge team at Wilson Airport or JKIA, Nairobi." />
        <meta property="og:image"       content="https://www.nairobijethouse.com/nairobi_jh_logo.webp" />
        <meta property="og:locale"      content="en_KE" />
        <meta property="og:site_name"   content="NairobiJetHouse" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Contact NairobiJetHouse | Private Jet & Yacht Charter" />
        <meta name="twitter:description" content="24/7 concierge team. Offices at Wilson Airport and JKIA, Nairobi." />
        <meta name="twitter:image"       content="https://www.nairobijethouse.com/nairobi_jh_logo.webp" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <div>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)', padding: '7rem 0 5rem' }}>
          <div className="container">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}><i className="bi bi-envelope" /> Get in Touch</span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.5rem', maxWidth: 580 }}>We're Here <em style={{ color: 'var(--gold-light)' }}>Around the Clock</em></h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 500, marginTop: '1rem', lineHeight: 1.8 }}>
              Our concierge team operates 24 hours a day, 7 days a week. Whether you have a question, a request, or simply want to learn more — we're ready.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <a href="tel:+254724878136" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 600 }}>
                <i className="bi bi-telephone-fill" /> +254 724 878 136
              </a>
              <a href="mailto:nairobijethouse@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                <i className="bi bi-envelope-fill" /> nairobijethouse@gmail.com
              </a>
              <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                <i className="bi bi-whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'start' }}>

              {/* Left — offices + channels */}
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Our Offices</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                  {OFFICES.map(({ city, address, phone, flag }) => (
                    <div key={city} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{flag}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>{city}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>{address}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginTop: '0.3rem' }}>{phone}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ marginBottom: '1.25rem' }}>Other Channels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { icon: 'bi-whatsapp', label: 'WhatsApp Business', val: '+254 724 878 136',           color: '#25D366' },
                    { icon: 'bi-envelope', label: 'Email (General)',   val: 'nairobijethouse@gmail.com',   color: 'var(--navy)' },
                    { icon: 'bi-people',   label: 'Careers',           val: 'careers@NairobiJetHouse.com', color: 'var(--navy)' },
                  ].map(({ icon, label, val, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)' }}>
                      <i className={`bi ${icon}`} style={{ color, fontSize: '1rem', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 500 }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — contact form */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ width: 64, height: 64, background: '#EBF7F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem', color: 'var(--green)' }}>
                      <i className="bi bi-check-lg" />
                    </div>
                    <h3 style={{ marginBottom: '0.75rem' }}>Message Received</h3>
                    <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                      {success.message || 'Thank you for reaching out. A member of our team will respond within 24 hours.'}
                    </p>
                    <button className="btn btn-navy" onClick={() => setSuccess(null)}>
                      <i className="bi bi-arrow-counterclockwise" /> Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ marginBottom: '0.4rem' }}>Send a Message</h3>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Fill in the form below and we'll get back to you within 24 hours.</p>

                    {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}

                    <form onSubmit={submit}>
                      <div className="form-grid" style={{ marginBottom: '1.1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Full Name <span className="req">*</span></label>
                          <input className="form-control" required value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email <span className="req">*</span></label>
                          <input className="form-control" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company</label>
                          <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your company (optional)" />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                        <label className="form-label">Subject <span className="req">*</span></label>
                        <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                          {SUBJECT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                        <label className="form-label">Message <span className="req">*</span></label>
                        <textarea className="form-control" required style={{ minHeight: 130 }} value={form.message} onChange={e => set('message', e.target.value)} placeholder="How can we help you?" />
                      </div>

                      <button type="submit" className="btn btn-navy" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</> : <><i className="bi bi-send" /> Send Message</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}