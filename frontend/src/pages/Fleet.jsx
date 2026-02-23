import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAircraft, getYachts } from '../services/api'

const AC_CATEGORIES = [
  { value: '', label: 'All Aircraft' },
  { value: 'light', label: 'Light Jets' },
  { value: 'midsize', label: 'Midsize Jets' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy', label: 'Heavy Jets' },
  { value: 'ultra_long', label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliners' },
]

export default function Fleet() {
  const [tab, setTab] = useState('aircraft')
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts] = useState([])
  const [acFilter, setAcFilter] = useState('')
  const [yachtFilter, setYachtFilter] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const acParams = acFilter ? `?category=${acFilter}` : ''
    const yParams = yachtFilter ? `?size_category=${yachtFilter}` : ''
    Promise.all([getAircraft(acParams), getYachts(yParams)])
      .then(([acData, yData]) => {
        setAircraft(acData.results || acData)
        setYachts(yData.results || yData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [acFilter, yachtFilter])

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Our Assets</span>
          <h1>The <em style={{ color: 'var(--gold)' }}>Fleet</em></h1>
          <p style={{ marginTop: '0.5rem' }}>Aircraft and vessels available for charter, booking, and lease.</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="tab-nav">
            <button className={`tab-btn ${tab === 'aircraft' ? 'active' : ''}`} onClick={() => setTab('aircraft')}>✈ Aircraft</button>
            <button className={`tab-btn ${tab === 'yachts' ? 'active' : ''}`} onClick={() => setTab('yachts')}>⚓ Yachts</button>
          </div>

          {tab === 'aircraft' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {AC_CATEGORIES.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setAcFilter(value)}
                    style={{
                      background: acFilter === value ? 'var(--gold)' : 'transparent',
                      color: acFilter === value ? 'var(--obsidian)' : 'var(--ivory-dim)',
                      border: `1px solid ${acFilter === value ? 'var(--gold)' : 'var(--ash)'}`,
                      padding: '0.4rem 1rem',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: 2,
                      fontFamily: 'var(--font-body)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><span className="loading-spinner" /></div>
              ) : (
                <div className="grid-3">
                  {aircraft.map(ac => (
                    <div key={ac.id} className="card">
                      {ac.image_url
                        ? <img src={ac.image_url} alt={ac.name} className="card-image" />
                        : <div className="card-image" style={{ background: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>✈</div>
                      }
                      <div className="card-body">
                        <span className="card-tag">{ac.category_display}</span>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--ivory)' }}>{ac.name}</h3>
                        <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>{ac.model}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--ivory-dim)' }}>
                          <span>👤 {ac.passenger_capacity} pax</span>
                          <span>🌍 {ac.range_km?.toLocaleString()} km</span>
                        </div>
                        {ac.description && <p style={{ fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.7 }}>{ac.description}</p>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <Link to="/book-flight" className="btn btn-primary" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}>Book</Link>
                          <Link to="/leasing" className="btn btn-ghost" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}>Lease</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {aircraft.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--ivory-dim)' }}>
                      No aircraft found in this category.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'yachts' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {[['', 'All Yachts'], ['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['superyacht', 'Superyacht']].map(([value, label]) => (
                  <button key={value} type="button"
                    onClick={() => setYachtFilter(value)}
                    style={{
                      background: yachtFilter === value ? 'var(--gold)' : 'transparent',
                      color: yachtFilter === value ? 'var(--obsidian)' : 'var(--ivory-dim)',
                      border: `1px solid ${yachtFilter === value ? 'var(--gold)' : 'var(--ash)'}`,
                      padding: '0.4rem 1rem', fontSize: '0.7rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: 'var(--font-body)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><span className="loading-spinner" /></div>
              ) : (
                <div className="grid-3">
                  {yachts.map(y => (
                    <div key={y.id} className="card">
                      {y.image_url
                        ? <img src={y.image_url} alt={y.name} className="card-image" />
                        : <div className="card-image" style={{ background: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>⚓</div>
                      }
                      <div className="card-body">
                        <span className="card-tag">{y.size_display}</span>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--ivory)' }}>{y.name}</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--ivory-dim)' }}>
                          <span>📏 {y.length_meters}m</span>
                          <span>👤 {y.guest_capacity} guests</span>
                          <span>⚓ {y.crew_count} crew</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                          ${parseInt(y.daily_rate_usd).toLocaleString()}/day
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <Link to="/yacht-charter" className="btn btn-primary" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}>Charter</Link>
                          <Link to="/leasing" className="btn btn-ghost" style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}>Lease</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {yachts.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--ivory-dim)' }}>
                      No yachts found.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}