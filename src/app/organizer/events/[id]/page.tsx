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

type Stats = {
  total: number
  bound: number
  pending: number
  invalid: number
  used: number
}

export default function EventAttendeesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<{ tickets: Ticket[]; stats: Stats; event: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    fetch(`/api/organizer/events/${params.id}/attendees`)
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(d => { if (d) { setData(d); setLoading(false) } })
  }, [params.id, router])

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading attendees...</div>
  if (!data) return null

  const { tickets, stats, event } = data
  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

  const statusColor: Record<string, string> = {
    PENDING_ID: 'var(--orange)',
    BOUND: 'var(--green)',
    INVALID: 'var(--red)',
    USED: 'var(--text-muted)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/organizer/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Dashboard</Link>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          fair<span style={{ color: 'var(--accent)' }}>pass</span>
        </span>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>{event.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {event.venue} · {event.city} · {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--text)' },
            { label: 'ID Bound', value: stats.bound, color: 'var(--green)' },
            { label: 'Pending ID', value: stats.pending, color: 'var(--orange)' },
            { label: 'Invalid', value: stats.invalid, color: 'var(--red)' },
            { label: 'Scanned', value: stats.used, color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
          {['ALL', 'BOUND', 'PENDING_ID', 'INVALID', 'USED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 16px',
                cursor: 'pointer',
                fontFamily: 'Syne',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: filter === status ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: filter === status ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Attendee table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            No tickets in this category.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 16, padding: '10px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Buyer</span>
              <span>Attendee name</span>
              <span>ID type</span>
              <span>Status</span>
              <span>Purchased</span>
            </div>
            {filtered.map(ticket => (
              <div key={ticket.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 16, padding: '14px 16px', background: 'var(--surface)', borderRadius: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{ticket.user.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ticket.user.email}</div>
                </div>
                <div style={{ color: ticket.attendeeName ? 'var(--text)' : 'var(--text-muted)' }}>
                  {ticket.attendeeName || '—'}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {ticket.idType || '—'}
                </div>
                <div>
                  <span style={{
                    background: `${statusColor[ticket.status]}20`,
                    color: statusColor[ticket.status],
                    borderRadius: 100,
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}