'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  venue: string
  city: string
  eventDate: string
  ticketPrice: number
  availableInventory: number
  totalInventory: number
  isHighDemand: boolean
  imageUrl: string | null
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([evData, meData]) => {
      setEvents(evData.events || [])
      setUser(meData.user || null)
      setAuthReady(true)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    setUser(null)
  }

  const popular = [...events]
    .sort((a, b) => {
      const soldA = (a.totalInventory - a.availableInventory) / a.totalInventory
      const soldB = (b.totalInventory - b.availableInventory) / b.totalInventory
      if (b.isHighDemand !== a.isHighDemand) return b.isHighDemand ? 1 : -1
      return soldB - soldA
    })
    .slice(0, 3)

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">
          fair<span className="brand-accent">pass</span>
        </Link>
        <div className="nav-actions">
          {!authReady ? null : user ? (
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
        <section className="hero-panel" style={{ padding: '48px 40px', marginBottom: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* Left: copy + CTAs */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 20 }}>
                <span style={dotStyle('var(--accent)')} />
                <span>Verified ticketing</span>
              </div>
              <h1 className="section-heading" style={{ marginBottom: 16 }}>
                Buy tickets at fair prices. No scalpers, no surprises.
              </h1>
              <p className="section-copy" style={{ marginBottom: 36 }}>
                Every ticket is identity-bound and transferable at face value. Browse events, manage your wallet, and know exactly what to expect at every step.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/events" className="button button-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                  Explore all events
                  {events.length > 0 && (
                    <span style={{ marginLeft: 10, opacity: 0.7, fontWeight: 400, fontSize: '0.88rem' }}>
                      {events.length} live
                    </span>
                  )}
                </Link>
                {authReady && user && user.role !== 'ORGANIZER' && (
                  <Link href="/tickets" className="button button-secondary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                    My tickets
                  </Link>
                )}
              </div>
            </div>

            {/* Right: popular events + feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
                  Trending now
                </span>
                <Link href="/events" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>

              {popular.length === 0
                ? [1, 2, 3].map(i => (
                    <div key={i} className="card-soft" style={{ height: i === 1 ? 160 : 88, opacity: 0.3 }} />
                  ))
                : popular.map((event, i) => (
                    <PopularEventCard key={event.id} event={event} featured={i === 0} />
                  ))
              }

            </div>
          </div>
        </section>

        {/* Full-width feature strip */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            ['ID-bound entry', 'Tickets stay permanently linked to the buyer\'s government ID. No anonymous transfers, no phantom seats.'],
            ['Face-value transfers', 'When life gets in the way, transfer your ticket at the exact price you paid — no markups, no middlemen.'],
            ['Clear organizer tools', 'Real-time inventory, attendee verification, and penalty tracking — all in one readable dashboard.'],
          ].map(([title, copy], i) => (
            <div key={title} style={{
              padding: '28px 26px',
              borderRadius: 'var(--radius-lg)',
              background: i === 1
                ? 'linear-gradient(135deg, rgba(87,217,201,0.18), rgba(87,217,201,0.06))'
                : 'linear-gradient(135deg, rgba(87,217,201,0.10), rgba(87,217,201,0.03))',
              border: `1px solid rgba(87,217,201,${i === 1 ? '0.30' : '0.15'})`,
              boxShadow: i === 1 ? '0 0 32px rgba(87,217,201,0.10)' : 'none',
            }}>
              <h3 style={{
                fontSize: '1.55rem',
                fontFamily: 'Sora',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 12,
                color: 'var(--accent-2)',
              }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>{copy}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

function PopularEventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const date = new Date(event.eventDate)
  const soldOut = event.availableInventory === 0
  const soldPct = ((event.totalInventory - event.availableInventory) / event.totalInventory) * 100
  const fewLeft = !soldOut && event.availableInventory < event.totalInventory * 0.15

  if (featured) {
    return (
      <Link href={`/events/${event.id}`} className="card-soft" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', textDecoration: 'none' }}>
        <div style={{ position: 'relative', height: 140, background: 'var(--surface-3)' }}>
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontFamily: 'Sora', fontSize: '1rem' }}>FairPass Live</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,17,27,0.05), rgba(7,17,27,0.72))' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {event.isHighDemand && <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>Hot</span>}
            {fewLeft && <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>Few left</span>}
            {soldOut && <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>Sold out</span>}
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{event.title}</h3>
            <p className="muted" style={{ fontSize: '0.8rem', color: 'rgba(238,244,251,0.75)' }}>{event.venue}, {event.city}</p>
          </div>
        </div>
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(soldPct, 100)}%`, background: soldPct > 85 ? 'var(--red)' : soldPct > 60 ? 'var(--orange)' : 'linear-gradient(90deg, var(--accent-2), var(--accent))' }} />
          </div>
          <span className="muted" style={{ fontSize: '0.78rem', flexShrink: 0 }}>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>Rs {event.ticketPrice.toLocaleString('en-IN')}</span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/events/${event.id}`} className="card-soft" style={{ display: 'flex', gap: 14, padding: 16, alignItems: 'center', textDecoration: 'none' }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: 'var(--surface-3)', flexShrink: 0 }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Sora' }}>Live</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</span>
          {event.isHighDemand && <span className="badge badge-accent" style={{ fontSize: '0.7rem', padding: '1px 8px' }}>Hot</span>}
          {fewLeft && <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '1px 8px' }}>Few left</span>}
          {soldOut && <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '1px 8px' }}>Sold out</span>}
        </div>
        <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 8 }}>{event.venue}, {event.city} · {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(soldPct, 100)}%`, background: soldPct > 85 ? 'var(--red)' : soldPct > 60 ? 'var(--orange)' : 'linear-gradient(90deg, var(--accent-2), var(--accent))' }} />
          </div>
          <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.92rem', flexShrink: 0 }}>Rs {event.ticketPrice.toLocaleString('en-IN')}</span>
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
