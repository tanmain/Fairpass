'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

type Listing = {
  id: string
  mode: string
  status: string
  faceValue: number
  convenienceFee: number
  expiresAt: string
  seller: { name: string }
  ticket: {
    event: {
      title: string
      venue: string
      city: string
      eventDate: string
      ticketPrice: number
    }
  }
}

export default function ClaimPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/resale/listing/${listingId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setListing(data.listing)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load listing')
        setLoading(false)
      })
  }, [listingId])

  async function handleClaim() {
    setPurchaseLoading(true)
    setPurchaseError('')
    const res = await fetch('/api/resale/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, ...form }),
    })
    const data = await res.json()
    setPurchaseLoading(false)
    if (!res.ok) {
      setPurchaseError(data.error)
      return
    }
    setSuccess(true)
  }

  const expired = listing ? new Date() > new Date(listing.expiresAt) : false
  const unavailable = listing && (listing.status !== 'ACTIVE' || expired)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="muted">Loading...</span>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Sora', fontSize: '1.4rem', marginBottom: 8 }}>Listing not available</h2>
          <p className="muted" style={{ marginBottom: 20 }}>{error || 'This listing may have expired or been cancelled.'}</p>
          <Link href="/resale"><button className="button button-primary">Browse resale tickets</button></Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460, textAlign: 'center' }}>
          <div className="badge badge-success" style={{ marginBottom: 14 }}>Ticket claimed!</div>
          <h2 style={{ fontFamily: 'Sora', fontSize: '1.4rem', marginBottom: 8 }}>You're going to {listing.ticket.event.title}!</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Your ticket is bound to your ID and your QR code is ready.</p>
          <Link href="/tickets"><button className="button button-primary" style={{ width: '100%' }}>View my tickets</button></Link>
        </div>
      </div>
    )
  }

  const timeLeft = new Date(listing.expiresAt).getTime() - Date.now()
  const minsLeft = Math.max(0, Math.floor(timeLeft / 60000))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 500 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&larr; Back to home</Link>

        <div style={{ marginTop: 24 }}>
          <div className="badge badge-cyan" style={{ marginBottom: 14 }}>Private listing from {listing.seller.name}</div>
          <h1 style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>{listing.ticket.event.title}</h1>
          <p className="muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
            {listing.ticket.event.venue}, {listing.ticket.event.city} · {new Date(listing.ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          {unavailable ? (
            <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '16px 14px', marginBottom: 18 }}>
              This listing has {expired ? 'expired' : 'been ' + listing.status.toLowerCase()}.
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(255,159,67,0.1)', border: '1px solid rgba(255,159,67,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: '0.875rem', color: '#ff9f43' }}>
                ⏱ {minsLeft} minutes remaining to claim
              </div>

              <div className="card-soft" style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Face value</span>
                  <strong>₹{listing.faceValue.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Convenience fee (5%)</span>
                  <strong>₹{listing.convenienceFee.toLocaleString('en-IN')}</strong>
                </div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Total</span>
                  <strong style={{ color: 'var(--accent)' }}>₹{(listing.faceValue + listing.convenienceFee).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Your ID details</h3>
              <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full name (as on ID)</label>
                  <input value={form.attendeeName} onChange={e => setForm({ ...form, attendeeName: e.target.value })} placeholder="Full name on ID" className="input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ID type</label>
                    <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} className="select">
                      {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ID number</label>
                    <input value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="Enter ID number" className="input" />
                  </div>
                </div>
              </div>

              {purchaseError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{purchaseError}</div>}

              <button
                onClick={handleClaim}
                disabled={purchaseLoading || !form.attendeeName || !form.idNumber}
                className="button button-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {purchaseLoading ? 'Processing...' : `Claim for ₹${(listing.faceValue + listing.convenienceFee).toLocaleString('en-IN')}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
