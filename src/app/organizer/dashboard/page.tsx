'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  title: string
  city: string
  eventDate: string
  status: string
  ticketPrice: number
  totalInventory: number
  availableInventory: number
  _count: { tickets: number }
}

type SortKey = 'date-asc' | 'date-desc' | 'revenue-desc' | 'sold-desc'

export default function OrganizerDashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('date-asc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/events?mine=true').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([evData, meData]) => {
      if (!meData.user || meData.user.role !== 'ORGANIZER') {
        router.push('/login')
        return
      }
      setEvents(evData.events || [])
      setUser(meData.user)
      setLoading(false)
    })
  }, [router])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    router.push('/')
  }

  if (loading) return <div className="app-shell" style={centerStyle}><span className="muted">Loading dashboard...</span></div>

  const totalSold = events.reduce((s, e) => s + (e.totalInventory - e.availableInventory), 0)
  const totalRevenue = events.reduce((s, e) => s + (e.totalInventory - e.availableInventory) * e.ticketPrice, 0)

  const filteredEvents = events
    .filter(e => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (![e.title, e.city].some(v => v.toLowerCase().includes(q))) return false
      }
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      if (sort === 'date-desc') return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      if (sort === 'revenue-desc') {
        const ra = (a.totalInventory - a.availableInventory) * a.ticketPrice
        const rb = (b.totalInventory - b.availableInventory) * b.ticketPrice
        return rb - ra
      }
      if (sort === 'sold-desc') return (b.totalInventory - b.availableInventory) - (a.totalInventory - a.availableInventory)
      return 0
    })

  const allStatuses = Array.from(new Set(events.map(e => e.status)))
  const hasActiveFilters = search || statusFilter !== 'all'

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/organizer/dashboard" className="brand">
          fair<span className="brand-accent">pass</span> <span className="brand-subtle">Organizer</span>
        </Link>
        <div className="nav-actions">
          <Link href="/organizer/events/new" className="button button-primary">New event</Link>
          <span className="muted">{user?.name}</span>
          <button onClick={logout} className="button button-ghost">Sign out</button>
        </div>
      </nav>

      <main className="page-container page-section">
        <section style={{ marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Organizer workspace</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Dashboard</h1>
          <p className="section-copy">A simpler overview of your events, sales, and next actions.</p>
        </section>

        <section className="grid-auto" style={{ marginBottom: 24 }}>
          {[
            ['Total events', `${events.length}`],
            ['Tickets sold', totalSold.toLocaleString('en-IN')],
            ['Gross revenue', `Rs ${totalRevenue.toLocaleString('en-IN')}`],
          ].map(([label, value]) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Your events</h2>
              <p className="muted">Each card shows status, sell-through, and a direct link to attendees.</p>
            </div>
            <Link href="/organizer/events/new" className="button button-secondary">Create event</Link>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-soft" style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 220px', minWidth: 180 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search events or cities…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, flex: 1, fontSize: '0.9rem' }}
              />
              {search && <button onClick={() => setSearch('')} className="button button-ghost" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>Clear</button>}
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="select"
              style={{ flex: '0 0 auto', minWidth: 180 }}
            >
              <option value="date-asc">Date: soonest first</option>
              <option value="date-desc">Date: latest first</option>
              <option value="revenue-desc">Revenue: highest first</option>
              <option value="sold-desc">Tickets sold: most first</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: '0.85rem' }}>Status:</span>
            {(['all', ...allStatuses]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`button ${statusFilter === s ? 'button-primary' : 'button-secondary'}`}
                style={{ padding: '4px 14px', fontSize: '0.85rem', minHeight: 32 }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
            {hasActiveFilters && (
              <button onClick={() => { setSearch(''); setStatusFilter('all') }} className="button button-ghost" style={{ padding: '4px 12px', fontSize: '0.83rem', minHeight: 32 }}>
                Reset
              </button>
            )}
            <div className="badge badge-neutral" style={{ marginLeft: 'auto' }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </div>
          </div>
        </section>

        {events.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No events published yet</h3>
            <p className="muted" style={{ marginBottom: 16 }}>Create your first event to start ticket sales and attendee verification.</p>
            <Link href="/organizer/events/new" className="button button-primary">Publish event</Link>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>No events match your filters</h3>
            <p className="muted" style={{ marginBottom: 14 }}>Try adjusting your search or status filter.</p>
            <button onClick={() => { setSearch(''); setStatusFilter('all') }} className="button button-secondary">Reset filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredEvents.map(event => {
              const soldCount = event.totalInventory - event.availableInventory
              const soldPct = (soldCount / event.totalInventory) * 100

              return (
                <div key={event.id} className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                        <h3 style={{ fontSize: '1.15rem' }}>{event.title}</h3>
                        <span className="badge badge-cyan">{event.status}</span>
                      </div>
                      <p className="muted">{event.city} | {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div className="card-soft" style={{ padding: 14, minWidth: 120 }}>
                        <div className="stat-label">Sold</div>
                        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.2rem' }}>{soldCount} / {event.totalInventory}</div>
                      </div>
                      <div className="card-soft" style={{ padding: 14, minWidth: 120 }}>
                        <div className="stat-label">Revenue</div>
                        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.2rem' }}>Rs {(soldCount * event.ticketPrice).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ height: '100%', width: `${Math.min(soldPct, 100)}%`, background: 'linear-gradient(90deg, var(--accent-2), var(--accent))' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="muted">{Math.round(soldPct)}% of inventory sold</span>
                    <Link href={`/organizer/events/${event.id}`} className="button button-secondary">View attendees</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
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
