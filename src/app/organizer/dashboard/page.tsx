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

export default function OrganizerDashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>

  const totalTicketsSold = events.reduce((sum, e) => sum + (e.totalInventory - e.availableInventory), 0)
  const totalRevenue = events.reduce((sum, e) => sum + (e.totalInventory - e.availableInventory) * e.ticketPrice, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/organizer/dashboard">
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            fair<span style={{ color: 'var(--accent)' }}>pass</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>Organizer</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/organizer/events/new">
            <button style={accentBtn}>+ New event</button>
          </Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button onClick={logout} style={{ ...ghostBtn, color: 'var(--text-muted)' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Total events', value: events.length },
            { label: 'Tickets sold', value: totalTicketsSold.toLocaleString('en-IN') },
            { label: 'Gross revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700 }}>Your events</h2>
          <Link href="/organizer/events/new">
            <button style={ghostBtn}>+ Create event</button>
          </Link>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, borderStyle: 'dashed' }}>
            No events yet.{' '}
            <Link href="/organizer/events/new" style={{ color: 'var(--accent)' }}>Create your first event →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map(event => {
              const soldPct = ((event.totalInventory - event.availableInventory) / event.totalInventory) * 100
              return (
                <div key={event.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>{event.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'rgba(232,255,71,0.1)', borderRadius: 100, padding: '2px 8px' }}>{event.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {event.city} · {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 100 }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>
                      {event.totalInventory - event.availableInventory} / {event.totalInventory}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>tickets sold</div>
                    <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${soldPct}%`, background: 'var(--accent)', borderRadius: 2 }} />
                    </div>
                  </div>
                  <Link href={`/organizer/events/${event.id}`}>
                    <button style={ghostBtn}>View attendees</button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
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
  whiteSpace: 'nowrap',
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