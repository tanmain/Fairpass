'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  title: string
  description: string
  venue: string
  city: string
  eventDate: string
  ticketPrice: number
  availableInventory: number
  totalInventory: number
  isHighDemand: boolean
  imageUrl: string | null
  organizer: { name: string }
}

type SortKey = 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'
type AvailFilter = 'all' | 'available' | 'sold-out'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('date-asc')
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all')
  const [demandOnly, setDemandOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([evData, meData]) => {
      setEvents(evData.events || [])
      setUser(meData.user || null)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const filtered = useMemo(() => {
    let result = [...events]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(e =>
        [e.title, e.city, e.venue, e.organizer.name].some(v => v.toLowerCase().includes(q))
      )
    }

    if (availFilter === 'available') result = result.filter(e => e.availableInventory > 0)
    if (availFilter === 'sold-out') result = result.filter(e => e.availableInventory === 0)
    if (demandOnly) result = result.filter(e => e.isHighDemand)
    if (maxPrice !== '') result = result.filter(e => e.ticketPrice <= Number(maxPrice))

    result.sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      if (sort === 'date-desc') return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      if (sort === 'price-asc') return a.ticketPrice - b.ticketPrice
      if (sort === 'price-desc') return b.ticketPrice - a.ticketPrice
      return 0
    })

    return result
  }, [events, search, sort, availFilter, demandOnly, maxPrice])

  const allCities = useMemo(() => Array.from(new Set(events.map(e => e.city))).sort(), [events])
  const hasActiveFilters = search || availFilter !== 'all' || demandOnly || maxPrice !== ''

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <div className="nav-actions">
          {user ? (
            <>
              <Link
                href={user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/tickets'}
                className="button button-secondary"
              >
                {user.role === 'ORGANIZER' ? 'Organizer hub' : 'My tickets'}
              </Link>
              <span className="muted">{user.name}</span>
              <button onClick={logout} className="button button-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="button button-secondary">Log in</Link>
              <Link href="/register" className="button button-primary">Create account</Link>
            </>
          )}
        </div>
      </nav>

      <main className="page-container page-section">
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Browse events</span>
          </div>
          <h1 className="section-heading" style={{ marginBottom: 8 }}>All events</h1>
          <p className="section-copy">Find events by city, artist, or venue. Use filters to narrow down what matters to you.</p>
        </div>

        {/* Search + Sort bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-soft" style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 280px', minWidth: 200 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search artists, venues, or cities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, flex: 1 }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="button button-ghost" style={{ padding: '2px 8px', fontSize: '0.82rem' }}>Clear</button>
            )}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="select"
            style={{ flex: '0 0 auto', minWidth: 160 }}
          >
            <option value="date-asc">Date: soonest first</option>
            <option value="date-desc">Date: latest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {/* Filter chips row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
          <span className="muted" style={{ fontSize: '0.85rem', marginRight: 2 }}>Filter:</span>

          {(['all', 'available', 'sold-out'] as AvailFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setAvailFilter(f)}
              className={`button ${availFilter === f ? 'button-primary' : 'button-secondary'}`}
              style={{ padding: '4px 14px', fontSize: '0.85rem', minHeight: 32 }}
            >
              {f === 'all' ? 'All' : f === 'available' ? 'Available' : 'Sold out'}
            </button>
          ))}

          <button
            onClick={() => setDemandOnly(!demandOnly)}
            className={`button ${demandOnly ? 'button-primary' : 'button-secondary'}`}
            style={{ padding: '4px 14px', fontSize: '0.85rem', minHeight: 32 }}
          >
            High demand
          </button>

          <div className="card-soft" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' }}>
            <span className="muted" style={{ fontSize: '0.83rem', whiteSpace: 'nowrap' }}>Max price</span>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="input"
              style={{ width: 80, border: 'none', background: 'transparent', boxShadow: 'none', padding: '0 4px', fontSize: '0.85rem' }}
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setAvailFilter('all'); setDemandOnly(false); setMaxPrice('') }}
              className="button button-ghost"
              style={{ padding: '4px 12px', fontSize: '0.83rem', minHeight: 32 }}
            >
              Reset all
            </button>
          )}

          <div className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ minHeight: 340, opacity: 0.4 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No events found</h3>
            <p className="muted" style={{ marginBottom: 18 }}>Try adjusting your search or filters.</p>
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setAvailFilter('all'); setDemandOnly(false); setMaxPrice('') }}
                className="button button-secondary"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {filtered.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.eventDate)
  const soldOut = event.availableInventory === 0
  const soldPct = ((event.totalInventory - event.availableInventory) / event.totalInventory) * 100
  const fewLeft = !soldOut && event.availableInventory < event.totalInventory * 0.15

  return (
    <Link href={`/events/${event.id}`} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 210, background: 'var(--surface-3)', flexShrink: 0 }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontFamily: 'Sora', fontSize: '1.2rem' }}>
            FairPass Live
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,17,27,0.08), rgba(7,17,27,0.78))' }} />
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {event.isHighDemand && <span className="badge badge-accent">Selling fast</span>}
          {fewLeft && <span className="badge badge-warning">Few left</span>}
          {soldOut && <span className="badge badge-danger">Sold out</span>}
        </div>
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
          <div className="badge badge-neutral" style={{ marginBottom: 10 }}>
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
          <h3 style={{ fontSize: '1.08rem', marginBottom: 4 }}>{event.title}</h3>
          <p className="muted" style={{ color: 'rgba(238,244,251,0.78)' }}>{event.venue}, {event.city}</p>
        </div>
      </div>

      <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', marginBottom: 14 }}>
          <div>
            <div className="muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.4rem' }}>
              Rs {event.ticketPrice.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="muted" style={{ textAlign: 'right', fontSize: '0.84rem' }}>
            {soldOut ? 'Unavailable' : `${event.availableInventory.toLocaleString('en-IN')} left`}
          </div>
        </div>
        <div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{
              height: '100%',
              width: `${Math.min(soldPct, 100)}%`,
              background: soldPct > 85 ? 'var(--red)' : soldPct > 60 ? 'var(--orange)' : 'linear-gradient(90deg, var(--accent-2), var(--accent))',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: '0.84rem' }}>
              {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="button button-secondary" style={{ minHeight: 36, padding: '0 14px', fontSize: '0.88rem' }}>
              {soldOut ? 'View details' : 'Book now'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function dotStyle(color: string) {
  return {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
  } as React.CSSProperties
}
