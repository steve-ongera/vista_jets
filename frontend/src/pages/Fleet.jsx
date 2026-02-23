import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAircraft, getYachts } from '../services/api'

const AC_CATS = [
  { value: '',             label: 'All Aircraft' },
  { value: 'light',        label: 'Light Jets' },
  { value: 'midsize',      label: 'Midsize Jets' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy',        label: 'Heavy Jets' },
  { value: 'ultra_long',   label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliners' },
]

const YACHT_CATS = [
  { value: '',           label: 'All Yachts' },
  { value: 'small',      label: 'Small (< 30m)' },
  { value: 'medium',     label: 'Medium (30–50m)' },
  { value: 'large',      label: 'Large (50–80m)' },
  { value: 'superyacht', label: 'Superyacht (80m+)' },
]

export default function Fleet() {
  const [tab, setTab]           = useState('aircraft')
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts]     = useState([])
  const [acFilter, setAcFilter] = useState('')
  const [yFilter, setYFilter]   = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAircraft(acFilter ? `?category=${acFilter}` : ''),
      getYachts(yFilter ? `?size_category=${yFilter}` : ''),
    ]).then(([ac, y]) => {
      setAircraft(ac.results || ac)
      setYachts(y.results || y)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [acFilter, yFilter])

  return (
    <div style={{ paddingTop: '68px' }}>
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-grid-3x3-gap" /> Fleet Catalogue</span>
          <h1>Our <em style={{ color: 'var(--gold-light)' }}>Fleet</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 560 }}>
            Every aircraft and yacht in the VistaJets network is independently certified, 
            regularly audited, and operated to the highest safety standards. 
            Browse our fleet and submit a charter or lease request directly from any listing.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="tab-nav">
            <button className={`tab-btn${tab === 'aircraft' ? ' active' : ''}`} onClick={() => setTab('aircraft')}>
              <i className="bi bi-airplane" /> Private Jets ({aircraft.length || '—'})
            </button>
            <button className={`tab-btn${tab === 'yachts' ? ' active' : ''}`} onClick={() => setTab('yachts')}>
              <i className="bi bi-water" /> Yachts ({yachts.length || '—'})
            </button>
          </div>

          {/* ── Aircraft Tab ── */}
          {tab === 'aircraft' && (
            <>
              <div className="filter-pills">
                {AC_CATS.map(({ value, label }) => (
                  <button key={value} className={`pill${acFilter === value ? ' active' : ''}`} onClick={() => setAcFilter(value)}>
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
              ) : (
                <>
                  {aircraft.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                      <i className="bi bi-airplane" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
                      No aircraft found in this category.
                    </div>
                  ) : (
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
                            <div className="card-meta" style={{ fontSize: '0.78rem' }}>{ac.model}</div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-people" style={{ color: 'var(--gold)' }} /> {ac.passenger_capacity} pax
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-arrow-left-right" style={{ color: 'var(--gold)' }} /> {ac.range_km?.toLocaleString()} km
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-speedometer2" style={{ color: 'var(--gold)' }} /> {ac.cruise_speed_kmh} km/h
                              </span>
                            </div>

                            {ac.description && (
                              <p style={{ fontSize: '0.8rem', lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {ac.description}
                              </p>
                            )}

                            {ac.amenities?.length > 0 && (
                              <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {ac.amenities.slice(0, 4).map(a => (
                                  <span key={a} style={{ fontSize: '0.68rem', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 4, padding: '2px 7px', color: 'var(--gray-600)' }}>{a}</span>
                                ))}
                                {ac.amenities.length > 4 && <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>+{ac.amenities.length - 4} more</span>}
                              </div>
                            )}

                            <div className="card-actions">
                              <Link to="/book-flight" className="btn btn-navy btn-sm"><i className="bi bi-airplane" /> Book</Link>
                              <Link to="/leasing" className="btn btn-outline-navy btn-sm"><i className="bi bi-file-earmark-text" /> Lease</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Yachts Tab ── */}
          {tab === 'yachts' && (
            <>
              <div className="filter-pills">
                {YACHT_CATS.map(({ value, label }) => (
                  <button key={value} className={`pill${yFilter === value ? ' active' : ''}`} onClick={() => setYFilter(value)}>
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
              ) : (
                <>
                  {yachts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
                      <i className="bi bi-water" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
                      No yachts found in this category.
                    </div>
                  ) : (
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

                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-arrows-expand-vertical" style={{ color: 'var(--gold)' }} /> {y.length_meters}m
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-people" style={{ color: 'var(--gold)' }} /> {y.guest_capacity} guests
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-person-badge" style={{ color: 'var(--gold)' }} /> {y.crew_count} crew
                              </span>
                            </div>

                            {y.home_port && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="bi bi-geo-alt" style={{ color: 'var(--gold)' }} /> {y.home_port}
                              </div>
                            )}

                            {y.description && (
                              <p style={{ fontSize: '0.8rem', lineHeight: 1.65, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {y.description}
                              </p>
                            )}

                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                              ${parseInt(y.daily_rate_usd).toLocaleString()}
                              <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--gray-400)' }}>/day</span>
                            </div>

                            <div className="card-actions">
                              <Link to="/yacht-charter" className="btn btn-navy btn-sm"><i className="bi bi-water" /> Charter</Link>
                              <Link to="/leasing" className="btn btn-outline-navy btn-sm"><i className="bi bi-file-earmark-text" /> Lease</Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}