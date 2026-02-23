import { useState, useEffect, useRef } from 'react'
import { searchAirports } from '../services/api'

export default function AirportSearch({ label, value, onChange, placeholder = 'City, airport or IATA code', required }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const ref = useRef(null)

  /* Search with debounce */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 2) { setResults([]); return }
      setLoading(true)
      try {
        const data = await searchAirports(query)
        setResults(data.results || data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  /* Click outside */
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayValue = query || (value ? `${value.city} (${value.code})` : '')

  const handleSelect = (airport) => {
    onChange(airport)
    setQuery(`${airport.city} (${airport.code})`)
    setOpen(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange(null)
  }

  return (
    <div className="form-group" ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <i className="bi bi-geo-alt" style={{
          position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--gray-400)', fontSize: '0.9rem', pointerEvents: 'none',
        }} />
        <input
          className="form-control"
          style={{ paddingLeft: '2.25rem' }}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        {loading && (
          <span className="spinner" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'var(--white)', border: '1.5px solid var(--gray-200)',
          borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)',
          maxHeight: 260, overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
        }}>
          {!loading && results.length === 0 && (
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--gray-400)' }}>
              <i className="bi bi-exclamation-circle" style={{ marginRight: 6 }} />
              No airports found for "{query}"
            </div>
          )}
          {results.map(airport => (
            <div
              key={airport.id}
              onClick={() => handleSelect(airport)}
              style={{
                padding: '0.75rem 1rem', cursor: 'pointer',
                borderBottom: '1px solid var(--gray-100)', transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)',
                  background: 'var(--gold-pale)', padding: '1px 7px', borderRadius: 4,
                  letterSpacing: '0.05em',
                }}>{airport.code}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{airport.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2, paddingLeft: 44 }}>
                {airport.city}, {airport.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}