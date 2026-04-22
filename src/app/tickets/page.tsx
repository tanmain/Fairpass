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
  event: { title: string; venue: string; city: string; eventDate: string; ticketPrice: number; penaltyPercent: number }
  purchase: { idDeadline: string; paymentRef: string }
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
  const [transferLoading, setTransferLoading] = useState<string | null>(null)
  const [transferModal, setTransferModal] = useState<{ code: string; expiresAt: string } | null>(null)
  const [bindForm, setBindForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [bindError, setBindError] = useState('')
  const [bindLoading, setBindLoading] = useState(false)

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

  async function handleTransfer(ticketId: string) {
    setTransferLoading(ticketId)
    const res = await fetch(`/api/tickets/${ticketId}/transfer`, { method: 'POST' })
    const data = await res.json()
    setTransferLoading(null)
    if (!res.ok) return
    setTransferModal({ code: data.transferCode, expiresAt: data.expiresAt })
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

  const activeCount = tickets.filter(ticket => ['PENDING_ID', 'BOUND'].includes(getEffectiveStatus(ticket))).length
  const readyForQrCount = tickets.filter(ticket => getEffectiveStatus(ticket) === 'BOUND').length

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <div className="nav-actions">
          <Link href="/events" className="button button-secondary">Browse events</Link>
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
          <div style={{ display: 'grid', gap: 18 }}>
            {tickets.map(ticket => (
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
                onTransfer={() => handleTransfer(ticket.id)}
                transferLoading={transferLoading === ticket.id}
              />
            ))}
          </div>
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
              <span className="muted">Consider transferring instead if you want to avoid the cancellation penalty.</span>
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

      {transferModal && (
        <div className="dialog-backdrop" onClick={() => setTransferModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-cyan" style={{ marginBottom: 14 }}>Transfer code</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Share this code with the buyer.</h3>
            <p className="muted" style={{ marginBottom: 18 }}>The code expires in 24 hours and can only be used once.</p>
            <div className="card-soft" style={{ padding: 22, marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Sora', fontSize: '2.1rem', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--accent)' }}>
                {transferModal.code.slice(0, 4)} {transferModal.code.slice(4)}
              </div>
            </div>
            <p className="muted" style={{ marginBottom: 18 }}>Expires: {new Date(transferModal.expiresAt).toLocaleString('en-IN')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigator.clipboard.writeText(transferModal.code)} className="button button-primary" style={{ flex: 1 }}>Copy code</button>
              <button onClick={() => setTransferModal(null)} className="button button-secondary" style={{ flex: 1 }}>Close</button>
            </div>
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
  onTransfer,
  transferLoading,
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
            <button onClick={onTransfer} disabled={transferLoading} className="button button-secondary">{transferLoading ? 'Generating...' : 'Transfer'}</button>
          </div>
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
