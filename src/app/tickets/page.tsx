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
  event: {
    title: string
    venue: string
    city: string
    eventDate: string
    ticketPrice: number
    penaltyPercent: number
  }
  purchase: {
    idDeadline: string
    paymentRef: string
  }
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
      if (!meData.user) { router.push('/login'); return }
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
    if (!res.ok) { setBindError(data.error); return }

    setTickets(prev => prev.map(t => t.id === ticketId
      ? { ...t, status: 'BOUND', attendeeName: data.ticket.attendeeName, idType: data.ticket.idType, idBoundAt: data.ticket.idBoundAt }
      : t
    ))
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
    setQrModal({
      dataURL: data.qrDataURL,
      attendeeName: data.attendeeName,
      eventTitle: data.eventTitle,
      idType: data.idType,
    })
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

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>Loading tickets...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/events">
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            fair<span style={{ color: 'var(--accent)' }}>pass</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/events"><button style={ghostBtn}>Events</button></Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.name}</span>
          <button onClick={logout} style={{ ...ghostBtn, color: 'var(--text-muted)' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>My tickets</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>
          Bind a government ID to each ticket to confirm your attendance.
        </p>

        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            No tickets yet.{' '}
            <Link href="/events" style={{ color: 'var(--accent)' }}>Browse events →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
      </div>

      {/* Cancel confirmation modal */}
      {cancelModal && !cancelResult && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={() => setCancelModal(null)}
        >
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--red)', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', marginBottom: 8 }}>Cancel this ticket?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
              You are about to cancel your ticket for <strong style={{ color: 'var(--text)' }}>{cancelModal.event.title}</strong>.
            </p>

            <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px', marginBottom: 20, fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Ticket price</span>
                <span>₹{cancelModal.event.ticketPrice.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--red)' }}>Penalty ({cancelModal.event.penaltyPercent}% retained)</span>
                <span style={{ color: 'var(--red)' }}>− ₹{(cancelModal.event.ticketPrice * cancelModal.event.penaltyPercent / 100).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span style={{ color: 'var(--green)' }}>You will receive</span>
                <span style={{ color: 'var(--green)' }}>₹{(cancelModal.event.ticketPrice * (1 - cancelModal.event.penaltyPercent / 100)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              💡 Can't attend? Consider <strong style={{ color: 'var(--accent)' }}>transferring your ticket</strong> to someone else at face value — no penalty fees.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleCancel(cancelModal.id)}
                disabled={cancelLoading}
                style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: cancelLoading ? 0.6 : 1 }}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, cancel ticket'}
              </button>
              <button onClick={() => setCancelModal(null)} style={{ ...ghostBtn, flex: 1 }}>
                Keep ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel success modal */}
      {cancelResult && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={() => { setCancelResult(null); setCancelModal(null) }}
        >
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--green)', borderRadius: 16, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', marginBottom: 8 }}>Ticket cancelled</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.6 }}>
              Your refund of <strong style={{ color: 'var(--green)' }}>₹{cancelResult.refundAmount.toLocaleString('en-IN')}</strong> has been processed.
              A penalty of <strong style={{ color: 'var(--red)' }}>₹{cancelResult.penaltyAmount.toLocaleString('en-IN')}</strong> was retained.
            </p>
            <button
              onClick={() => { setCancelResult(null); setCancelModal(null) }}
              style={accentBtn}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Transfer code modal */}
{transferModal && (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
    onClick={() => setTransferModal(null)}
  >
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>↔️</div>
      <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', marginBottom: 8 }}>Transfer code generated</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
        Share this code with the buyer. It expires in 24 hours and can only be used once.
      </p>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 16px', marginBottom: 16 }}>
  <div style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)', textAlign: 'center' }}>
    <div style={{ fontSize: '2.5rem', letterSpacing: '0.3em' }}>{transferModal.code.slice(0, 4)}</div>
    <div style={{ color: 'var(--border)', fontSize: '1rem', margin: '4px 0' }}>· · · ·</div>
    <div style={{ fontSize: '2.5rem', letterSpacing: '0.3em' }}>{transferModal.code.slice(4)}</div>
  </div>
</div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 24 }}>
        Expires: {new Date(transferModal.expiresAt).toLocaleString('en-IN')}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { navigator.clipboard.writeText(transferModal.code) }}
          style={{ ...accentBtn, flex: 1, padding: '11px' }}
        >
          Copy code
        </button>
        <button onClick={() => setTransferModal(null)} style={{ ...ghostBtn, flex: 1 }}>
          Close
        </button>
      </div>

      <div style={{ marginTop: 20, padding: '12px', background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Buyer redeems at: <strong style={{ color: 'var(--accent)' }}>localhost:3000/transfer</strong>
      </div>
    </div>
  </div>
)}

      {/* QR Modal */}
      {qrModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
          onClick={() => setQrModal(null)}
        >
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 380, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.2rem', marginBottom: 4 }}>Entry QR Code</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>{qrModal.eventTitle}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 24 }}>
              {qrModal.attendeeName} · {qrModal.idType}
            </p>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, display: 'inline-block', marginBottom: 24 }}>
              <img src={qrModal.dataURL} alt="QR code" style={{ width: 240, height: 240, display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={downloadQR} style={{ ...accentBtn, flex: 1 }}>↓ Download PNG</button>
              <button onClick={() => setQrModal(null)} style={{ ...ghostBtn, flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket, isBinding, bindForm, bindError, bindLoading, qrLoading, onStartBind, onCancelBind, onBind, onFormChange, onShowQR, onCancelTicket, onTransfer, transferLoading }: any) {
  const deadline = new Date(ticket.purchase.idDeadline)
  const now = new Date()
  const expired = now > deadline
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 3600000))
  const minsLeft = Math.max(0, Math.floor(((deadline.getTime() - now.getTime()) % 3600000) / 60000))

  const statusColor: Record<string, string> = {
    PENDING_ID: 'var(--orange)',
    BOUND: 'var(--green)',
    INVALID: 'var(--red)',
    USED: 'var(--text-muted)',
    TRANSFERRED: 'var(--text-muted)',
    REFUNDED: 'var(--text-muted)',
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem' }}>{ticket.event.title}</h3>
            <span style={{
              background: `${statusColor[ticket.status]}20`,
              color: statusColor[ticket.status],
              border: `1px solid ${statusColor[ticket.status]}40`,
              borderRadius: 100,
              padding: '2px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <div>{ticket.event.venue} · {ticket.event.city}</div>
            <div>{new Date(ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700 }}>₹{ticket.event.ticketPrice.toLocaleString('en-IN')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: 4 }}>{ticket.purchase.paymentRef}</div>
        </div>
      </div>

      {ticket.status === 'PENDING_ID' && (
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ background: expired ? 'rgba(255,71,87,0.08)' : 'rgba(255,159,67,0.08)', border: `1px solid ${expired ? 'var(--red)' : 'var(--orange)'}40`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>
            {expired
              ? <span style={{ color: 'var(--red)' }}>⚠️ Grace period expired — ticket will be invalidated</span>
              : <span style={{ color: 'var(--orange)' }}>⏱ Add ID within: <strong>{hoursLeft}h {minsLeft}m</strong> · Deadline: {deadline.toLocaleString('en-IN')}</span>
            }
          </div>
          {!isBinding ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onStartBind} disabled={expired} style={{ ...accentBtn, flex: 1, opacity: expired ? 0.5 : 1 }}>
                Bind government ID
              </button>
              <button onClick={onCancelTicket} style={{ background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)40', borderRadius: 8, padding: '10px 16px', fontFamily: 'Syne', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Cancel
              </button>
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
        </div>
      )}

      {ticket.status === 'BOUND' && (
        <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--green)' }}>✓ </span>
            Bound to <strong style={{ color: 'var(--text)' }}>{ticket.attendeeName}</strong> · {ticket.idType}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onShowQR} disabled={qrLoading} style={{ ...ghostBtn, opacity: qrLoading ? 0.6 : 1 }}>
              {qrLoading ? 'Loading...' : '🔲 View QR'}
            </button>
            <button
              onClick={onTransfer}
              disabled={transferLoading}
              style={{ ...ghostBtn, opacity: transferLoading ? 0.6 : 1 }}
            >
              {transferLoading ? 'Generating...' : '↔ Transfer'}
          </button>
          </div>
        </div>
      )}

      {ticket.status === 'INVALID' && (
        <div style={{ padding: '0 24px 20px', fontSize: '0.875rem', color: 'var(--red)' }}>
          Ticket invalidated — grace period expired without ID binding.
        </div>
      )}

      {ticket.status === 'REFUNDED' && (
        <div style={{ padding: '0 24px 20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Ticket cancelled — refund processed.
        </div>
      )}
    </div>
  )
}

function BindForm({ form, error, loading, onChange, onSubmit, onCancel }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Attendee name</label>
          <input
            value={form.attendeeName}
            onChange={e => onChange({ ...form, attendeeName: e.target.value })}
            placeholder="Full name (as on ID)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>ID type</label>
          <select
            value={form.idType}
            onChange={e => onChange({ ...form, idType: e.target.value })}
            style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
          >
            {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>ID number</label>
        <input
          value={form.idNumber}
          onChange={e => onChange({ ...form, idNumber: e.target.value })}
          placeholder="Enter your ID number"
          style={inputStyle}
        />
      </div>
      {error && <div style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onSubmit} disabled={loading} style={{ ...accentBtn, flex: 1 }}>
          {loading ? 'Saving...' : 'Confirm & bind ID'}
        </button>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
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
  padding: '10px 16px',
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 5,
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
}