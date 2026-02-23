import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <span className="footer-logo">VISTA<span style={{ color: 'var(--gold)' }}>JETS</span></span>
            <p style={{ maxWidth: 280, lineHeight: 1.8 }}>
              Private aviation and yacht charter at the pinnacle of luxury. 
              Available 24/7 — no membership required.
            </p>
            <div className="divider" style={{ marginTop: '1.5rem' }} />
            <p style={{ fontSize: '0.8rem' }}>+1 (800) VISTA-JET</p>
            <p style={{ fontSize: '0.8rem' }}>concierge@vistajets.com</p>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Aviation</h4>
            <ul className="footer-links">
              <li><Link to="/book-flight">Book a Flight</Link></li>
              <li><Link to="/flight-inquiry">Flight Inquiry</Link></li>
              <li><Link to="/fleet">Our Fleet</Link></li>
              <li><Link to="/leasing">Aircraft Leasing</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Maritime</h4>
            <ul className="footer-links">
              <li><Link to="/yacht-charter">Yacht Charter</Link></li>
              <li><Link to="/leasing">Yacht Leasing</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>Support</h4>
            <ul className="footer-links">
              <li><Link to="/track">Track Booking</Link></li>
              <li><a href="mailto:concierge@vistajets.com">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VistaJets. All rights reserved.</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            Elevating Every Journey
          </span>
        </div>
      </div>
    </footer>
  )
}