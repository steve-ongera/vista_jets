// src/pages/Contact.jsx
import { useState } from 'react'
import { createContactInquiry } from '../services/api'

const OFFICES = [
  { city: 'Geneva', address: 'Rue de Rive 13, 1204 Geneva, Switzerland', phone: '+41 22 000 0000', flag: '🇨🇭' },
  { city: 'New York', address: '767 Fifth Avenue, New York, NY 10153, USA', phone: '+1 212 000 0000', flag: '🇺🇸' },
  { city: 'Dubai', address: 'DIFC, Gate Village 6, Dubai, UAE', phone: '+971 4 000 0000', flag: '🇦🇪' },
  { city: 'Singapore', address: '1 Raffles Quay #26-10, Singapore 048583', phone: '+65 6000 0000', flag: '🇸🇬' },
]

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Customer Support' },
  { value: 'media', label: 'Media & Press' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'careers', label: 'Careers' },
  { value: 'other', label: 'Other' },
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
            <a href="tel:+18005478538" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 600 }}>
              <i className="bi bi-telephone-fill" /> +1 (800) 547-8538
            </a>
            <a href="mailto:concierge@NairobiJetHouse.com" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              <i className="bi bi-envelope-fill" /> concierge@NairobiJetHouse.com
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
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
              <h3 style={{ marginBottom: '1.5rem' }}>Global Offices</h3>
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
                  { icon: 'bi-whatsapp', label: 'WhatsApp Business', val: '+1 (800) 547-8538', color: '#25D366' },
                  { icon: 'bi-envelope', label: 'Email (General)', val: 'concierge@NairobiJetHouse.com', color: 'var(--navy)' },
                  { icon: 'bi-envelope', label: 'Media & Press', val: 'press@NairobiJetHouse.com', color: 'var(--navy)' },
                  { icon: 'bi-people', label: 'Careers', val: 'careers@NairobiJetHouse.com', color: 'var(--navy)' },
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
                        <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
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
  )
}