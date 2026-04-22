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
  maxTicketsPerID: number
  gracePeriodHours: number
  penaltyPercent: number
  isHighDemand: boolean
  organizer: { name: string }
}

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${params.eventId}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([evData, meData]) => {
      setEvent(evData.event)
      setUser(meData.user)
      setLoading(false)
    })
  }, [params.eventId])

  async function handlePurchase() {
    if (!user) { router.push('/login'); return }
    setPurchasing(true)
    setError('')

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event!.id, quantity }),
    })
    const data = await res.json()
    setPurchasing(false)

    if (!res.ok) { setError(data.error || 'Purchase failed'); return }
    setSuccess(data)
  }

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (!event) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--red)' }}>Event not found.</div>

  const date = new Date(event.eventDate)
  const total = (event.ticketPrice * quantity).toLocaleString('en-IN')

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--green)', borderRadius: 16, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎟️</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem', marginBottom: 8, color: 'var(--green)' }}>
            Tickets purchased!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            You have <strong style={{ color: 'var(--orange)' }}>{event.gracePeriodHours} hours</strong> to add attendee IDs.
            After that, unbound tickets will be invalidated and a {event.penaltyPercent}% penalty fee will be retained.
          </p>
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 16, marginBottom: 24, fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'left' }}>
            <div>Payment ref: <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{success.purchase.paymentRef}</span></div>
            <div style={{ marginTop: 8 }}>ID deadline: <span style={{ color: 'var(--orange)' }}>{new Date(success.purchase.idDeadline).toLocaleString('en-IN')}</span></div>
          </div>
          <Link href="/tickets">
            <button style={accentBtn}>Add IDs to my tickets →</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/events" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← All events</Link>
        {user && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.name}</span>}
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <span style={chip}>📍 {event.city}</span>
          {event.isHighDemand && <span style={{ ...chip, background: 'rgba(232,255,71,0.1)', color: 'var(--accent)', border: '1px solid rgba(232,255,71,0.3)' }}>⚡ High demand</span>}
        </div>

        <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
          {event.title}
        </h1>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
          {event.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Venue', value: event.venue },
            { label: 'City', value: event.city },
            { label: 'Date', value: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Time', value: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
            { label: 'Available', value: `${event.availableInventory} / ${event.totalInventory} tickets` },
            { label: 'Organized by', value: event.organizer.name },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>🪪 ID binding required</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Each ticket must be bound to a government ID within <strong style={{ color: 'var(--text)' }}>{event.gracePeriodHours} hours</strong> of purchase.
            Unbound tickets will be invalidated and a <strong style={{ color: 'var(--orange)' }}>{event.penaltyPercent}% penalty fee</strong> will be retained.
            Maximum <strong style={{ color: 'var(--text)' }}>{event.maxTicketsPerID} tickets</strong> per ID.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>
                ₹{event.ticketPrice.toLocaleString('en-IN')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>per ticket</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={qtyBtn}>−</button>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', minWidth: 20, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(event.maxTicketsPerID, event.availableInventory, q + 1))} style={qtyBtn}>+</button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: '0.875rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={purchasing || event.availableInventory === 0}
            style={{ ...accentBtn, width: '100%', padding: '14px', fontSize: '1rem', opacity: (purchasing || event.availableInventory === 0) ? 0.6 : 1 }}
          >
            {purchasing ? 'Processing...' : event.availableInventory === 0 ? 'Sold out' : `Buy ${quantity} ticket${quantity > 1 ? 's' : ''} · ₹${total}`}
          </button>

          {!user && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: 12 }}>
              You'll be asked to <Link href="/login" style={{ color: 'var(--accent)' }}>log in</Link> before purchasing
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const chip: React.CSSProperties = {
  background: 'var(--surface-2)',
  color: 'var(--text-muted)',
  border: '1px solid var(--border)',
  borderRadius: 100,
  padding: '4px 12px',
  fontSize: '0.8rem',
  fontWeight: 500,
}

const accentBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  fontFamily: 'Syne',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'block',
  padding: '10px 20px',
}

const qtyBtn: React.CSSProperties = {
  background: 'var(--surface-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  width: 36,
  height: 36,
  cursor: 'pointer',
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '1.1rem',
}