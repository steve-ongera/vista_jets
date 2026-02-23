import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <span className="footer-logo">Vista<span>Jets</span></span>
            <p>
              The world's leading private aviation and yacht charter platform. 
              Instant access to over 2,400 aircraft and 800 vessels in 187 countries — 
              with no membership, no subscription, and no waiting.
            </p>
            <div style={{ marginTop: '1.5rem' }} className="footer-contact">
              <a href="tel:+18005478538"><i className="bi bi-telephone" /> +1 (800) 547-8538</a>
              <a href="mailto:concierge@vistajets.com"><i className="bi bi-envelope" /> concierge@vistajets.com</a>
              <a href="#"><i className="bi bi-geo-alt" /> 1 World Trade Center, New York, NY</a>
            </div>
          </div>

          {/* Aviation */}
          <div>
            <span className="footer-heading">Aviation</span>
            <ul className="footer-links">
              <li><Link to="/book-flight">Book a Private Jet</Link></li>
              <li><Link to="/flight-inquiry">Flight Inquiry</Link></li>
              <li><Link to="/fleet">Aircraft Fleet</Link></li>
              <li><Link to="/leasing">Aircraft Leasing</Link></li>
            </ul>
          </div>

          {/* Maritime */}
          <div>
            <span className="footer-heading">Maritime</span>
            <ul className="footer-links">
              <li><Link to="/yacht-charter">Charter a Yacht</Link></li>
              <li><Link to="/leasing">Yacht Leasing</Link></li>
              <li><Link to="/fleet">Yacht Fleet</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <span className="footer-heading">Company</span>
            <ul className="footer-links">
              <li><Link to="/track">Track Your Booking</Link></li>
              <li><a href="#">Safety Standards</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VistaJets International Ltd. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem' }}><i className="bi bi-linkedin" /></a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem' }}><i className="bi bi-instagram" /></a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem' }}><i className="bi bi-twitter-x" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}