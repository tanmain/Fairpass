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
  qrToken: string | null
  transferCount: number
  maxTransfers: number
  event: { title: string; venue: string; city: string; eventDate: string; ticketPrice: number; penaltyPercent: number }
  purchase: { idDeadline: string; paymentRef: string }
  resaleListings: { id: string; mode: string; status: string; faceValue: number; sellerPayout: number; expiresAt: string }[]
}

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bindingId, setBindingId] = useState<string | null>(null)
  const [cancelModal, setCancelModal] = useState<Ticket | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelResult, setCancelResult] = useState<{ penaltyAmount: number; refundAmount: number } | null>(null)
  const [qrModal, setQrModal] = useState<{ dataURL: string; attendeeName: string; eventTitle: string; idType: string } | null>(null)
  const [qrLoading, setQrLoading] = useState<string | null>(null)
  const [resaleModal, setResaleModal] = useState<string | null>(null)
  const [resaleMode, setResaleMode] = useState<'PRIVATE' | 'PUBLIC'>('PUBLIC')
  const [resaleEmail, setResaleEmail] = useState('')
  const [resaleLoading, setResaleLoading] = useState(false)
  const [resaleError, setResaleError] = useState('')
  const [resaleSuccess, setResaleSuccess] = useState<{ mode: string; faceValue: number; platformFee: number; sellerPayout: number } | null>(null)
  const [cancelListingLoading, setCancelListingLoading] = useState<string | null>(null)
  const [bindForm, setBindForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [bindError, setBindError] = useState('')
  const [bindLoading, setBindLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/tickets').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([tData, meData]) => {
      if (!meData.user) {
        router.push('/login')
        return
      }
      setTickets(tData.tickets || [])
      setUser(meData.user)
      setLoading(false)
    })
  }, [router])

  async function handleBind(ticketId: string) {
    setBindLoading(true)
    setBindError('')
    const res = await fetch(`/api/tickets/${ticketId}/bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bindForm),
    })
    const data = await res.json()
    setBindLoading(false)
    if (!res.ok) {
      setBindError(data.error)
      return
    }
    setTickets(prev =>
      prev.map(t => t.id === ticketId
        ? { ...t, status: 'BOUND', attendeeName: data.ticket.attendeeName, idType: data.ticket.idType, idBoundAt: data.ticket.idBoundAt }
        : t))
    setBindingId(null)
    if (data.ticket.qrDataURL) {
      setQrModal({
        dataURL: data.ticket.qrDataURL,
        attendeeName: data.ticket.attendeeName,
        eventTitle: tickets.find(t => t.id === ticketId)?.event.title || '',
        idType: data.ticket.idType,
      })
    }
  }

  async function handleCancel(ticketId: string) {
    setCancelLoading(true)
    const res = await fetch(`/api/tickets/${ticketId}/cancel`, { method: 'POST' })
    const data = await res.json()
    setCancelLoading(false)
    if (!res.ok) return
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'REFUNDED' } : t))
    setCancelResult({ penaltyAmount: data.penaltyAmount, refundAmount: data.refundAmount })
  }

  async function showQR(ticketId: string) {
    setQrLoading(ticketId)
    const res = await fetch(`/api/tickets/${ticketId}/qr`)
    const data = await res.json()
    setQrLoading(null)
    if (!res.ok) return
    setQrModal({ dataURL: data.qrDataURL, attendeeName: data.attendeeName, eventTitle: data.eventTitle, idType: data.idType })
  }

  async function handleResaleList(ticketId: string) {
    setResaleLoading(true)
    setResaleError('')
    const res = await fetch('/api/resale/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId,
        mode: resaleMode,
        targetBuyerEmail: resaleMode === 'PRIVATE' ? resaleEmail : undefined,
      }),
    })
    const data = await res.json()
    setResaleLoading(false)
    if (!res.ok) {
      setResaleError(data.error)
      return
    }
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'LISTED',
      resaleListings: [{
        id: data.listing.id,
        mode: resaleMode,
        status: 'ACTIVE',
        faceValue: data.listing.faceValue,
        sellerPayout: data.listing.sellerPayout,
        expiresAt: data.listing.expiresAt,
      }]
    } : t))
    setResaleSuccess({
      mode: resaleMode,
      faceValue: data.listing.faceValue,
      platformFee: data.listing.platformFee,
      sellerPayout: data.listing.sellerPayout,
    })
  }

  async function handleCancelListing(listingId: string) {
    setCancelListingLoading(listingId)
    const res = await fetch('/api/resale/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    })
    setCancelListingLoading(null)
    if (res.ok) {
      setTickets(prev => prev.map(t => {
        const hasListing = t.resaleListings.some(l => l.id === listingId)
        return hasListing ? { ...t, status: 'BOUND', resaleListings: [] } : t
      }))
    }
  }

  function downloadQR() {
    if (!qrModal) return
    const link = document.createElement('a')
    link.href = qrModal.dataURL
    link.download = `fairpass-ticket-${qrModal.attendeeName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.click()
  }

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return <div className="app-shell" style={centerStyle}><span className="muted">Loading tickets...</span></div>
  }

  const activeCount = tickets.filter(ticket => ['PENDING_ID', 'BOUND', 'LISTED'].includes(getEffectiveStatus(ticket))).length
  const readyForQrCount = tickets.filter(ticket => getEffectiveStatus(ticket) === 'BOUND').length

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(t => getEffectiveStatus(t) === filter)

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <div className="nav-actions">
          <Link href="/events" className="button button-secondary">Browse events</Link>
          <Link href="/resale" className="button button-secondary">Resale</Link>
          <span className="muted">{user?.name}</span>
          <button onClick={logout} className="button button-ghost">Sign out</button>
        </div>
      </nav>

      <main className="page-container page-section">
        <section className="hero-panel" style={{ padding: 28, marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Ticket wallet</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-heading" style={{ marginBottom: 12 }}>Manage IDs, QR codes, transfers, and refunds in one calmer flow.</h1>
              <p className="section-copy">Ticket states are now easier to scan: what needs attention, what is ready for entry, and what has already been resolved.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, minWidth: 320, flex: '0 0 360px' }}>
              <div className="stat-card">
                <div className="stat-label">Active tickets</div>
                <div className="stat-value">{activeCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Ready for QR</div>
                <div className="stat-value">{readyForQrCount}</div>
              </div>
            </div>
          </div>
        </section>

        {tickets.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>No tickets yet</h2>
            <p className="muted" style={{ marginBottom: 16 }}>When you buy an event, it will appear here with the next required action.</p>
            <Link href="/events" className="button button-primary">Browse events</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'PENDING_ID', label: 'Needs ID' },
                { key: 'BOUND', label: 'Ready' },
                { key: 'LISTED', label: 'Listed' },
                { key: 'INVALID', label: 'Expired' },
                { key: 'REFUNDED', label: 'Refunded' },
                { key: 'USED', label: 'Used' },
              ].map(({ key, label }) => {
                const count = key === 'all' ? tickets.length : tickets.filter(t => getEffectiveStatus(t) === key).length
                if (count === 0 && key !== 'all') return null
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`button ${filter === key ? 'button-primary' : 'button-secondary'}`}
                    style={{ padding: '4px 14px', fontSize: '0.85rem', minHeight: 32 }}
                  >
                    {label}
                    <span style={{ marginLeft: 7, opacity: 0.65, fontWeight: 400 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center' }}>
                <p className="muted">No tickets in this category.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 18 }}>
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isBinding={bindingId === ticket.id}
                    bindForm={bindForm}
                    bindError={bindError}
                    bindLoading={bindLoading}
                    qrLoading={qrLoading === ticket.id}
                    onStartBind={() => { setBindingId(ticket.id); setBindError('') }}
                    onCancelBind={() => setBindingId(null)}
                    onBind={() => handleBind(ticket.id)}
                    onFormChange={setBindForm}
                    onShowQR={() => showQR(ticket.id)}
                    onCancelTicket={() => setCancelModal(ticket)}
                    onResell={() => { setResaleModal(ticket.id); setResaleError(''); setResaleMode('PUBLIC'); setResaleEmail('') }}
                    onCancelListing={(listingId: string) => handleCancelListing(listingId)}
                    cancelListingLoading={cancelListingLoading === (ticket.resaleListings[0]?.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {cancelModal && !cancelResult && (
        <div className="dialog-backdrop" onClick={() => setCancelModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-danger" style={{ marginBottom: 14 }}>Cancel ticket</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Cancel this ticket?</h3>
            <p className="muted" style={{ marginBottom: 18 }}>
              This will cancel your ticket for {cancelModal.event.title} and apply the policy below.
            </p>
            <div className="card-soft" style={{ padding: 16, marginBottom: 18 }}>
              <Row label="Ticket price" value={`Rs ${cancelModal.event.ticketPrice.toLocaleString('en-IN')}`} />
              <Row label={`Penalty (${cancelModal.event.penaltyPercent}%)`} value={`Rs ${(cancelModal.event.ticketPrice * cancelModal.event.penaltyPercent / 100).toLocaleString('en-IN')}`} />
              <div className="divider" style={{ margin: '12px 0' }} />
              <Row label="Refund amount" value={`Rs ${(cancelModal.event.ticketPrice * (1 - cancelModal.event.penaltyPercent / 100)).toLocaleString('en-IN')}`} />
            </div>
            <div className="card-soft" style={{ padding: 14, marginBottom: 18 }}>
              <span className="muted">Consider reselling instead if you want to avoid the cancellation penalty.</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleCancel(cancelModal.id)} disabled={cancelLoading} className="button button-danger" style={{ flex: 1 }}>
                {cancelLoading ? 'Cancelling...' : 'Confirm cancel'}
              </button>
              <button onClick={() => setCancelModal(null)} className="button button-secondary" style={{ flex: 1 }}>Keep ticket</button>
            </div>
          </div>
        </div>
      )}

      {cancelResult && (
        <div className="dialog-backdrop" onClick={() => { setCancelResult(null); setCancelModal(null) }}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Refund processed</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ticket cancelled</h3>
            <p className="muted" style={{ marginBottom: 20 }}>
              Refund amount: Rs {cancelResult.refundAmount.toLocaleString('en-IN')} | Penalty retained: Rs {cancelResult.penaltyAmount.toLocaleString('en-IN')}
            </p>
            <button onClick={() => { setCancelResult(null); setCancelModal(null) }} className="button button-primary button-full">Done</button>
          </div>
        </div>
      )}

      {resaleModal && !resaleSuccess && (
        <div className="dialog-backdrop" onClick={() => setResaleModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-cyan" style={{ marginBottom: 14 }}>List for resale</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Resell this ticket</h3>
            <p className="muted" style={{ marginBottom: 18 }}>
              Your ticket will be listed at face value. Choose who can buy it.
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <button
                onClick={() => setResaleMode('PUBLIC')}
                className={`button ${resaleMode === 'PUBLIC' ? 'button-primary' : 'button-secondary'}`}
                style={{ flex: 1 }}
              >
                Public
              </button>
              <button
                onClick={() => setResaleMode('PRIVATE')}
                className={`button ${resaleMode === 'PRIVATE' ? 'button-primary' : 'button-secondary'}`}
                style={{ flex: 1 }}
              >
                Private
              </button>
            </div>

            {resaleMode === 'PRIVATE' && (
              <div style={{ marginBottom: 18 }}>
                <label className="label">Recipient's email</label>
                <input
                  value={resaleEmail}
                  onChange={e => setResaleEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="input"
                  type="email"
                />
              </div>
            )}

            {(() => {
              const ticket = tickets.find(t => t.id === resaleModal)
              if (!ticket) return null
              const faceValue = ticket.event.ticketPrice
              const platformFee = faceValue * 0.05
              const sellerPayout = faceValue - platformFee
              return (
                <div className="card-soft" style={{ padding: 16, marginBottom: 18 }}>
                  <Row label="Face value" value={`₹${faceValue.toLocaleString('en-IN')}`} />
                  <Row label="Platform fee (5%)" value={`-₹${platformFee.toLocaleString('en-IN')}`} />
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <Row label="Your payout" value={`₹${sellerPayout.toLocaleString('en-IN')}`} />
                </div>
              )
            })()}

            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 18 }}>
              {resaleMode === 'PUBLIC'
                ? 'Your ticket will appear on the public resale page until someone buys it or the event is within 24 hours.'
                : 'The recipient will have 2 hours to claim this ticket.'}
            </p>

            {resaleError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{resaleError}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleResaleList(resaleModal)}
                disabled={resaleLoading || (resaleMode === 'PRIVATE' && !resaleEmail)}
                className="button button-primary"
                style={{ flex: 1 }}
              >
                {resaleLoading ? 'Listing...' : 'Confirm listing'}
              </button>
              <button onClick={() => setResaleModal(null)} className="button button-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {resaleSuccess && (
        <div className="dialog-backdrop" onClick={() => { setResaleSuccess(null); setResaleModal(null) }}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Listed!</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ticket listed for resale</h3>
            <p className="muted" style={{ marginBottom: 20 }}>
              {resaleSuccess.mode === 'PUBLIC'
                ? 'Your ticket is now visible on the resale marketplace.'
                : 'The recipient has been notified and has 2 hours to claim it.'}
              {' '}Your payout when sold: ₹{resaleSuccess.sellerPayout.toLocaleString('en-IN')}
            </p>
            <button onClick={() => { setResaleSuccess(null); setResaleModal(null) }} className="button button-primary button-full">Done</button>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="dialog-backdrop" onClick={() => setQrModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Entry ready</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{qrModal.eventTitle}</h3>
            <p className="muted" style={{ marginBottom: 18 }}>{qrModal.attendeeName} | {qrModal.idType}</p>
            <div style={{ background: 'white', padding: 16, borderRadius: 20, display: 'inline-block', marginBottom: 18 }}>
              <img src={qrModal.dataURL} alt="QR code" style={{ width: 240, height: 240, display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={downloadQR} className="button button-primary" style={{ flex: 1 }}>Download QR</button>
              <button onClick={() => setQrModal(null)} className="button button-secondary" style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketCard({
  ticket,
  isBinding,
  bindForm,
  bindError,
  bindLoading,
  qrLoading,
  onStartBind,
  onCancelBind,
  onBind,
  onFormChange,
  onShowQR,
  onCancelTicket,
  onResell,
  onCancelListing,
  cancelListingLoading,
}: any) {
  const deadline = new Date(ticket.purchase.idDeadline)
  const now = new Date()
  const effectiveStatus = getEffectiveStatus(ticket)
  const expired = effectiveStatus === 'INVALID'
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 3600000))
  const minsLeft = Math.max(0, Math.floor(((deadline.getTime() - now.getTime()) % 3600000) / 60000))

  const statusClass: Record<string, string> = {
    PENDING_ID: 'badge-warning',
    BOUND: 'badge-success',
    LISTED: 'badge-cyan',
    INVALID: 'badge-danger',
    USED: 'badge-neutral',
    TRANSFERRED: 'badge-neutral',
    REFUNDED: 'badge-neutral',
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <h3 style={{ fontSize: '1.28rem' }}>{ticket.event.title}</h3>
            <span className={`badge ${statusClass[effectiveStatus] || 'badge-neutral'}`}>{effectiveStatus.replace('_', ' ')}</span>
          </div>
          <p className="muted">{ticket.event.venue} | {ticket.event.city}</p>
          <p className="muted">{new Date(ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.3rem' }}>Rs {ticket.event.ticketPrice.toLocaleString('en-IN')}</div>
          <div className="muted" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ticket.purchase.paymentRef}</div>
        </div>
      </div>

      {effectiveStatus === 'PENDING_ID' && (
        <>
          <div className="badge badge-warning" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 16 }}>
            {`Bind ID within ${hoursLeft}h ${minsLeft}m | Deadline ${deadline.toLocaleString('en-IN')}`}
          </div>
          {!isBinding ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={onStartBind} className="button button-primary">Bind government ID</button>
              <button onClick={onCancelTicket} className="button button-danger">Cancel ticket</button>
            </div>
          ) : (
            <BindForm
              form={bindForm}
              error={bindError}
              loading={bindLoading}
              onChange={onFormChange}
              onSubmit={onBind}
              onCancel={onCancelBind}
            />
          )}
        </>
      )}

      {effectiveStatus === 'BOUND' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="card-soft" style={{ padding: 14, flex: 1 }}>
            <span className="muted">Bound to </span>
            <strong>{ticket.attendeeName}</strong>
            <span className="muted"> | {ticket.idType}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onShowQR} disabled={qrLoading} className="button button-secondary">{qrLoading ? 'Loading QR...' : 'View QR'}</button>
            {ticket.transferCount < ticket.maxTransfers && (
              <button onClick={onResell} className="button button-secondary">Resell</button>
            )}
          </div>
        </div>
      )}

      {effectiveStatus === 'LISTED' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="card-soft" style={{ padding: 14, flex: 1 }}>
            <span className="badge badge-cyan" style={{ marginRight: 10 }}>Listed for resale</span>
            <span className="muted">
              {ticket.resaleListings[0]?.mode === 'PRIVATE' ? 'Private listing' : 'Public listing'}
              {' · '}Payout: ₹{ticket.resaleListings[0]?.sellerPayout.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => onCancelListing(ticket.resaleListings[0]?.id)}
            disabled={cancelListingLoading}
            className="button button-danger"
          >
            {cancelListingLoading ? 'Cancelling...' : 'Cancel listing'}
          </button>
        </div>
      )}

      {effectiveStatus === 'INVALID' && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>Ticket invalidated because the grace period expired.</div>}
      {effectiveStatus === 'REFUNDED' && <div className="badge badge-neutral" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>Ticket cancelled and refund processed.</div>}
    </div>
  )
}

function BindForm({ form, error, loading, onChange, onSubmit, onCancel }: any) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Attendee name</label>
          <input value={form.attendeeName} onChange={e => onChange({ ...form, attendeeName: e.target.value })} placeholder="Full name on ID" className="input" />
        </div>
        <div>
          <label className="label">ID type</label>
          <select value={form.idType} onChange={e => onChange({ ...form, idType: e.target.value })} className="select">
            {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">ID number</label>
        <input value={form.idNumber} onChange={e => onChange({ ...form, idNumber: e.target.value })} placeholder="Enter your ID number" className="input" />
      </div>
      {error && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onSubmit} disabled={loading} className="button button-primary">{loading ? 'Saving...' : 'Confirm and bind'}</button>
        <button onClick={onCancel} className="button button-secondary">Cancel</button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function getEffectiveStatus(ticket: Ticket) {
  if (ticket.status === 'PENDING_ID' && new Date(ticket.purchase.idDeadline) < new Date()) {
    return 'INVALID'
  }

  return ticket.status
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
