'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function loadRazorpayScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve((window as any).Razorpay)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve((window as any).Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

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
  imageUrl: string | null
  organizer: { name: string }
}

type TimeLeft = { days: number; hours: number; mins: number; secs: number }

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [user, setUser] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewers, setViewers] = useState(0)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, mins: 0, secs: 0 })

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

  useEffect(() => {
    setViewers(Math.floor(Math.random() * 1800) + 500)
    const id = setInterval(() => {
      setViewers(v => Math.max(180, Math.min(5000, v + Math.floor(Math.random() * 30) - 12)))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!event) return
    const tick = () => {
      const diff = new Date(event.eventDate).getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [event])

  async function handlePurchase() {
    if (!user) {
      router.push('/login')
      return
    }
    setPurchasing(true)
    setError('')

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'PRIMARY_PURCHASE', eventId: event!.id, quantity }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to create order')
        setPurchasing(false)
        return
      }

      // Step 2: Load Razorpay and open checkout
      const Razorpay = await loadRazorpayScript()
      const rzp = new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'FairPass',
        description: `${quantity} ticket${quantity > 1 ? 's' : ''} for ${event!.title}`,
        theme: { color: '#e8ff47' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Step 3: Verify payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            setPurchasing(false)
            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment verification failed')
              return
            }
            setSuccess(verifyData)
          } catch {
            setPurchasing(false)
            setError('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setPurchasing(false)
          },
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
      })
      rzp.open()
    } catch (err: any) {
      setPurchasing(false)
      setError(err.message || 'Something went wrong')
    }
  }

  if (loading) return <div className="app-shell" style={centerStyle}><span className="muted">Loading event...</span></div>
  if (!event) return <div className="app-shell" style={centerStyle}><span style={{ color: 'var(--red)' }}>Event not found.</span></div>

  const date = new Date(event.eventDate)
  const soldOut = event.availableInventory === 0
  const fillPct = ((event.totalInventory - event.availableInventory) / event.totalInventory) * 100
  const fewLeft = !soldOut && event.availableInventory < event.totalInventory * 0.15
  const total = (event.ticketPrice * quantity).toLocaleString('en-IN')
  const isFuture = date > new Date()

  if (success) {
    return (
      <div className="app-shell" style={centerStyle}>
        <div className="panel" style={{ maxWidth: 520, width: '100%', padding: 0, overflow: 'hidden' }}>
          {event.imageUrl ? <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : null}
          <div style={{ padding: 28 }}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Purchase complete</div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Your tickets are ready for ID binding.</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              Bind each ticket within {event.gracePeriodHours} hours to keep entry smooth. Cancellation keeps {event.penaltyPercent}% after the grace window.
            </p>
            <div className="card-soft" style={{ padding: 18, marginBottom: 20 }}>
              <div className="muted" style={{ marginBottom: 6 }}>Payment reference</div>
              <div style={{ fontFamily: 'monospace', marginBottom: 10 }}>{success.purchase.paymentRef}</div>
              <div className="muted">ID deadline: {new Date(success.purchase.idDeadline).toLocaleString('en-IN')}</div>
            </div>
            <Link href="/tickets" className="button button-primary button-full">Go to my tickets</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <Link href={user ? (user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/') : '/'} className="button button-secondary">
          Back
        </Link>
      </nav>

      <main className="page-container page-section">
        <section className="hero-panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: event.imageUrl ? '340px minmax(0, 1fr)' : '1fr', gap: 24, alignItems: 'center' }}>
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 20 }} />
            ) : null}

            <div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="badge badge-neutral">{viewers.toLocaleString()} viewing now</span>
                {event.isHighDemand && <span className="badge badge-accent">High demand</span>}
                {fewLeft && <span className="badge badge-warning">Only {event.availableInventory} left</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)', marginBottom: 12 }}>{event.title}</h1>
              <p className="muted" style={{ marginBottom: 14 }}>
                {event.venue}, {event.city} | {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="section-copy" style={{ maxWidth: 720 }}>
                {event.description || 'A verified ticketed experience with clear purchase, transfer, and attendee validation flows.'}
              </p>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24 }}>
          <div style={{ display: 'grid', gap: 18 }}>
            {isFuture && (
              <div className="panel">
                <div className="stat-label" style={{ marginBottom: 14 }}>Event starts in</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    ['Days', timeLeft.days],
                    ['Hours', timeLeft.hours],
                    ['Mins', timeLeft.mins],
                    ['Secs', timeLeft.secs],
                  ].map(([label, value]) => (
                    <div key={label as string} className="card-soft" style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.7rem', color: 'var(--accent)' }}>{String(value).padStart(2, '0')}</div>
                      <div className="muted" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid-auto">
              {[
                ['Organized by', event.organizer.name],
                ['Max tickets per ID', `${event.maxTicketsPerID}`],
                ['Grace period', `${event.gracePeriodHours} hours`],
                ['Cancellation retention', `${event.penaltyPercent}%`],
              ].map(([label, value]) => (
                <div key={label} className="stat-card">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ fontSize: '1.15rem' }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="panel">
              <h2 style={{ fontSize: '1.35rem', marginBottom: 10 }}>Entry policy</h2>
              <p className="muted">
                Each ticket must be linked to a government ID after purchase. Transfers stay locked to face value, which keeps resale fair while still allowing genuine fans to pass tickets on.
              </p>
            </div>
          </div>

          <aside style={{ position: 'sticky', top: 92, alignSelf: 'start' }}>
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="stat-label">Ticket price</div>
                  <div style={{ fontFamily: 'Sora', fontSize: '2rem', fontWeight: 700 }}>Rs {event.ticketPrice.toLocaleString('en-IN')}</div>
                </div>
                <div className={soldOut ? 'badge badge-danger' : 'badge badge-accent'}>
                  {soldOut ? 'Sold out' : `${Math.round(fillPct)}% sold`}
                </div>
              </div>

              <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', width: `${Math.min(fillPct, 100)}%`, background: 'linear-gradient(90deg, var(--accent-2), var(--accent))' }} />
              </div>

              {!soldOut && (
                <div className="card-soft" style={{ padding: 16, marginBottom: 16 }}>
                  <div className="muted" style={{ marginBottom: 10 }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="button button-secondary" style={{ minWidth: 42 }}>-</button>
                    <div style={{ minWidth: 44, textAlign: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: '1.15rem' }}>{quantity}</div>
                    <button onClick={() => setQuantity(q => Math.min(event.maxTicketsPerID, event.availableInventory, q + 1))} className="button button-secondary" style={{ minWidth: 42 }}>+</button>
                    <span className="muted" style={{ fontSize: '0.84rem' }}>Max {event.maxTicketsPerID}</span>
                  </div>
                </div>
              )}

              {quantity > 1 && !soldOut && (
                <div className="card-soft" style={{ padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Total</span>
                  <strong>Rs {total}</strong>
                </div>
              )}

              {error && <div className="badge badge-danger" style={{ marginBottom: 14, width: '100%', justifyContent: 'center', padding: '10px 12px' }}>{error}</div>}

              <button onClick={handlePurchase} disabled={purchasing || soldOut} className="button button-primary button-full" style={{ minHeight: 52, marginBottom: 12 }}>
                {purchasing ? 'Processing...' : soldOut ? 'Sold out' : `Buy ${quantity > 1 ? `${quantity} tickets` : 'ticket'} | Rs ${total}`}
              </button>

              {!user && (
                <p className="muted" style={{ fontSize: '0.84rem', marginBottom: 14, textAlign: 'center' }}>
                  You&apos;ll be asked to <Link href="/login" className="text-accent">log in</Link> before checkout.
                </p>
              )}

              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  `${event.availableInventory.toLocaleString('en-IN')} tickets currently available`,
                  `${event.gracePeriodHours} hours to bind each ticket`,
                  'Face-value transfers only',
                ].map(item => (
                  <div key={item} className="card-soft" style={{ padding: 14 }}>
                    <span className="muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
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
