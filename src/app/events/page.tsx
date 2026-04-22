'use client'
import { useEffect, useState } from 'react'
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
  organizer: { name: string }
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([evData, meData]) => {
      setEvents(evData.events || [])
      setUser(meData.user)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/events">
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            fair<span style={{ color: 'var(--accent)' }}>pass</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <Link href="/tickets">
                <button style={ghostBtn}>My tickets</button>
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {user.name}
              </span>
              <button onClick={logout} style={{ ...ghostBtn, color: 'var(--text-muted)' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login"><button style={ghostBtn}>Log in</button></Link>
              <Link href="/register"><button style={accentBtn}>Sign up</button></Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            Upcoming events
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            All tickets are ID-bound. One person, one ticket.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 80 }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 80 }}>No events published yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.eventDate)
  const soldOut = event.availableInventory === 0
  const fillPct = ((event.totalInventory - event.availableInventory) / event.totalInventory) * 100

  return (
    <Link href={`/events/${event.id}`}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 24,
          cursor: 'pointer',
          transition: 'border-color 0.15s, transform 0.15s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <span style={tag('#1a1a24', 'var(--text-muted)')}>📍 {event.city}</span>
          {event.isHighDemand && <span style={tag('rgba(232,255,71,0.1)', 'var(--accent)')}>⚡ High demand</span>}
          {soldOut && <span style={tag('rgba(255,71,87,0.1)', 'var(--red)')}>Sold out</span>}
        </div>

        <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, flex: 1 }}>
          {event.title}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>
          {event.description?.substring(0, 90)}...
        </p>

        <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div>{event.venue}</div>
          <div style={{ marginTop: 4 }}>
            {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${fillPct}%`, background: fillPct > 80 ? 'var(--red)' : 'var(--accent)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {soldOut ? 'Sold out' : `${event.availableInventory} tickets left`}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>
            ₹{event.ticketPrice.toLocaleString('en-IN')}
          </span>
          <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

function tag(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: `1px solid ${color}40`,
    borderRadius: 100,
    padding: '3px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-block',
  }
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 16px',
  fontFamily: 'Syne',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
}

const accentBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
}