'use client'
import { useEffect, useState, useMemo } from 'react'
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

type ResaleListing = {
  id: string
  faceValue: number
  convenienceFee: number
  expiresAt: string
  seller: { name: string }
  ticket: {
    event: {
      id: string
      title: string
      venue: string
      city: string
      eventDate: string
      ticketPrice: number
      imageUrl: string | null
    }
  }
}

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

export default function ResaleDiscoveryPage() {
  const router = useRouter()
  const [listings, setListings] = useState<ResaleListing[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [purchaseModal, setPurchaseModal] = useState<ResaleListing | null>(null)
  const [purchaseForm, setPurchaseForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ eventTitle: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/resale/discovery').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([rData, meData]) => {
      setListings(rData.listings || [])
      setUser(meData.user || null)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const cities = useMemo(() => Array.from(new Set(listings.map(l => l.ticket.event.city))).sort(), [listings])

  const filtered = useMemo(() => {
    let result = [...listings]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        [l.ticket.event.title, l.ticket.event.venue, l.ticket.event.city].some(v => v.toLowerCase().includes(q))
      )
    }
    if (cityFilter) {
      result = result.filter(l => l.ticket.event.city === cityFilter)
    }
    return result
  }, [listings, search, cityFilter])

  async function handlePurchase() {
    if (!purchaseModal) return
    setPurchaseLoading(true)
    setPurchaseError('')

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RESALE_PURCHASE', listingId: purchaseModal.id }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setPurchaseError(orderData.error || 'Failed to create order')
        setPurchaseLoading(false)
        return
      }

      // Step 2: Open Razorpay checkout
      const Razorpay = await loadRazorpayScript()
      const rzp = new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'FairPass',
        description: `Resale ticket for ${purchaseModal.ticket.event.title}`,
        theme: { color: '#e8ff47' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Step 3: Verify payment with ID details
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                attendeeName: purchaseForm.attendeeName,
                idType: purchaseForm.idType,
                idNumber: purchaseForm.idNumber,
              }),
            })
            const verifyData = await verifyRes.json()
            setPurchaseLoading(false)
            if (!verifyRes.ok) {
              setPurchaseError(verifyData.error || 'Payment verification failed')
              return
            }
            setPurchaseSuccess({ eventTitle: verifyData.eventTitle })
            setListings(prev => prev.filter(l => l.id !== purchaseModal.id))
          } catch {
            setPurchaseLoading(false)
            setPurchaseError('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setPurchaseLoading(false)
          },
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
      })
      rzp.open()
    } catch (err: any) {
      setPurchaseLoading(false)
      setPurchaseError(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <div className="nav-actions">
          <Link href="/events" className="button button-secondary">Events</Link>
          {user ? (
            <>
              <Link href="/tickets" className="button button-secondary">My tickets</Link>
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
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span>Resale marketplace</span>
          </div>
          <h1 className="section-heading" style={{ marginBottom: 8 }}>Face-value resale tickets</h1>
          <p className="section-copy">Tickets listed by other fans at the original price. Every ticket is ID-verified.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
          <div className="card-soft" style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 280px', minWidth: 200 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search events, venues, or cities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, flex: 1 }}
            />
          </div>
          {cities.length > 1 && (
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="select"
              style={{ flex: '0 0 auto', minWidth: 140 }}
            >
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <div className="badge badge-neutral">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => <div key={i} className="card" style={{ minHeight: 200, opacity: 0.4 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No resale tickets available</h3>
            <p className="muted" style={{ marginBottom: 18 }}>Check back later or browse primary event listings.</p>
            <Link href="/events" className="button button-secondary">Browse events</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {filtered.map(listing => (
              <div key={listing.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 160, background: 'var(--surface-3)', flexShrink: 0 }}>
                  {listing.ticket.event.imageUrl ? (
                    <img src={listing.ticket.event.imageUrl} alt={listing.ticket.event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontFamily: 'Sora' }}>FairPass Live</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,17,27,0.08), rgba(7,17,27,0.78))' }} />
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="badge badge-accent">Resale</span>
                  </div>
                  <div style={{ position: 'absolute', left: 14, bottom: 14 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{listing.ticket.event.title}</h3>
                    <p className="muted" style={{ fontSize: '0.85rem', color: 'rgba(238,244,251,0.78)' }}>{listing.ticket.event.venue}, {listing.ticket.event.city}</p>
                  </div>
                </div>
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div className="muted" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                      {new Date(listing.ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <div>
                        <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</div>
                        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.3rem' }}>₹{listing.faceValue.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="muted" style={{ fontSize: '0.82rem' }}>+₹{listing.convenienceFee.toLocaleString('en-IN')} fee</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) { router.push('/login'); return }
                      setPurchaseModal(listing)
                      setPurchaseForm({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
                      setPurchaseError('')
                    }}
                    className="button button-primary"
                    style={{ width: '100%' }}
                  >
                    Buy ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {purchaseModal && !purchaseSuccess && (
        <div className="dialog-backdrop" onClick={() => setPurchaseModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-accent" style={{ marginBottom: 14 }}>Purchase resale ticket</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{purchaseModal.ticket.event.title}</h3>
            <p className="muted" style={{ marginBottom: 18 }}>
              Bind your government ID to complete the purchase.
            </p>

            <div className="card-soft" style={{ padding: 16, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Face value</span>
                <strong>₹{purchaseModal.faceValue.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Convenience fee (5%)</span>
                <strong>₹{purchaseModal.convenienceFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="divider" style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Total</span>
                <strong style={{ color: 'var(--accent)' }}>₹{(purchaseModal.faceValue + purchaseModal.convenienceFee).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Full name (as on ID)</label>
                  <input value={purchaseForm.attendeeName} onChange={e => setPurchaseForm({ ...purchaseForm, attendeeName: e.target.value })} placeholder="Full name on ID" className="input" />
                </div>
                <div>
                  <label className="label">ID type</label>
                  <select value={purchaseForm.idType} onChange={e => setPurchaseForm({ ...purchaseForm, idType: e.target.value })} className="select">
                    {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">ID number</label>
                <input value={purchaseForm.idNumber} onChange={e => setPurchaseForm({ ...purchaseForm, idNumber: e.target.value })} placeholder="Enter your ID number" className="input" />
              </div>
            </div>

            {purchaseError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{purchaseError}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handlePurchase}
                disabled={purchaseLoading || !purchaseForm.attendeeName || !purchaseForm.idNumber}
                className="button button-primary"
                style={{ flex: 1 }}
              >
                {purchaseLoading ? 'Processing...' : `Pay ₹${(purchaseModal.faceValue + purchaseModal.convenienceFee).toLocaleString('en-IN')}`}
              </button>
              <button onClick={() => setPurchaseModal(null)} className="button button-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {purchaseSuccess && (
        <div className="dialog-backdrop" onClick={() => { setPurchaseSuccess(null); setPurchaseModal(null) }}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Ticket secured!</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>You're going to {purchaseSuccess.eventTitle}!</h3>
            <p className="muted" style={{ marginBottom: 20 }}>Your ticket has been bound to your ID and a QR code is ready.</p>
            <Link href="/tickets">
              <button className="button button-primary button-full">View my tickets</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
