import { useState, useEffect, useRef } from 'react'
import { searchAirports } from '../services/api'

export default function AirportSearch({ label, value, onChange, placeholder = 'City or airport code' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length < 2) { setResults([]); return }
      setLoading(true)
      try {
        const data = await searchAirports(query)
        setResults(data.results || data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (airport) => {
    onChange(airport)
    setQuery(`${airport.city} (${airport.code})`)
    setOpen(false)
  }

  return (
    <div className="form-group" ref={ref} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}
      <input
        className="form-input"
        value={query || (value ? `${value.city} (${value.code})` : '')}
        onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null) }}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
      />
      {open && (query.length >= 2) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--slate)', border: '1px solid var(--ash)',
          borderTop: 'none', borderRadius: '0 0 2px 2px', maxHeight: 250, overflowY: 'auto'
        }}>
          {loading && (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--ivory-dim)', fontSize: '0.8rem' }}>
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--ivory-dim)', fontSize: '0.8rem' }}>
              No airports found
            </div>
          )}
          {results.map(airport => (
            <div key={airport.id} onClick={() => handleSelect(airport)} style={{
              padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--ash)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--smoke)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--gold)', marginRight: 8 }}>{airport.code}</span>
                {airport.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ivory-dim)' }}>
                {airport.city}, {airport.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}