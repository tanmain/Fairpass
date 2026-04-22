'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Ticket = {
  id: string
  status: string
  attendeeName: string | null
  idType: string | null
  idBoundAt: string | null
  user: { name: string; email: string }
  createdAt: string
}

type Stats = { total: number; bound: number; pending: number; invalid: number; used: number }

export default function EventAttendeesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<{ tickets: Ticket[]; stats: Stats; event: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch(`/api/organizer/events/${params.id}/attendees`)
      .then(r => {
        if (r.status === 401) {
          router.push('/login')
          return null
        }
        return r.json()
      })
      .then(d => {
        if (d) {
          setData(d)
          setLoading(false)
        }
      })
  }, [params.id, router])

  if (loading) return <div className="app-shell" style={centerStyle}><span className="muted">Loading attendees...</span></div>
  if (!data) return null

  const { tickets, stats, event } = data
  const filtered = filter === 'ALL' ? tickets : tickets.filter(ticket => ticket.status === filter)
  const statusClass: Record<string, string> = {
    PENDING_ID: 'badge-warning',
    BOUND: 'badge-success',
    INVALID: 'badge-danger',
    USED: 'badge-neutral',
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/organizer/dashboard" className="button button-secondary">Dashboard</Link>
        <span className="brand">fair<span className="brand-accent">pass</span></span>
      </nav>

      <main className="page-container page-section">
        <section className="hero-panel" style={{ padding: 28, marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Attendee overview</span>
          </div>
          <h1 className="section-heading" style={{ marginBottom: 10 }}>{event.title}</h1>
          <p className="section-copy">{event.venue} | {event.city} | {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </section>

        <section className="grid-auto" style={{ marginBottom: 24 }}>
          {[
            ['Total', `${stats.total}`],
            ['ID bound', `${stats.bound}`],
            ['Pending ID', `${stats.pending}`],
            ['Invalid', `${stats.invalid}`],
            ['Scanned', `${stats.used}`],
          ].map(([label, value]) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            {['ALL', 'BOUND', 'PENDING_ID', 'INVALID', 'USED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={filter === status ? 'button button-primary' : 'button button-secondary'}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card-soft" style={{ padding: 18, textAlign: 'center' }}>
              <span className="muted">No tickets in this category.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.map(ticket => (
                <div key={ticket.id} className="card-soft" style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{ticket.user.name}</div>
                      <div className="muted" style={{ fontSize: '0.88rem' }}>{ticket.user.email}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{ticket.attendeeName || 'Not bound yet'}</div>
                      <div className="muted" style={{ fontSize: '0.88rem' }}>{ticket.idType || 'No ID type'}</div>
                    </div>
                    <div>
                      <span className={`badge ${statusClass[ticket.status] || 'badge-neutral'}`}>{ticket.status.replace('_', ' ')}</span>
                    </div>
                    <div className="muted" style={{ textAlign: 'right' }}>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
