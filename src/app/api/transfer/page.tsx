'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

export default function TransferRedeemPage() {
  const router = useRouter()
  const [step, setStep] = useState<'code' | 'id' | 'success'>('code')
  const [code, setCode] = useState('')
  const [form, setForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ eventTitle: string } | null>(null)

  async function handleRedeem() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/transfer/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...form }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to redeem transfer')
      return
    }

    setResult(data)
    setStep('success')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460 }}>

        <Link href="/events" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to events</Link>

        {step === 'code' && (
          <>
            <h1 style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, marginTop: 24, marginBottom: 8 }}>
              Redeem transfer
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem', lineHeight: 1.6 }}>
              Enter the 8-digit transfer code shared by the ticket seller.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Transfer code</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="12345678"
                maxLength={8}
                style={{ ...inputStyle, fontSize: '1.5rem', letterSpacing: '0.2em', textAlign: 'center', fontFamily: 'Syne', fontWeight: 700 }}
              />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>
                {code.length}/8 digits
              </div>
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <button
              onClick={() => { setError(''); setStep('id') }}
              disabled={code.length !== 8}
              style={{ ...accentBtn, width: '100%', padding: '13px', opacity: code.length !== 8 ? 0.5 : 1 }}
            >
              Continue →
            </button>
          </>
        )}

        {step === 'id' && (
          <>
            <h1 style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, marginTop: 24, marginBottom: 8 }}>
              Your details
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem', lineHeight: 1.6 }}>
              The ticket will be bound to your government ID. Make sure the details match exactly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Full name (as on ID)</label>
                <input
                  value={form.attendeeName}
                  onChange={e => setForm({ ...form, attendeeName: e.target.value })}
                  placeholder="Rahul Sharma"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>ID type</label>
                <select
                  value={form.idType}
                  onChange={e => setForm({ ...form, idType: e.target.value })}
                  style={{ ...inputStyle, appearance: 'none' } as React.CSSProperties}
                >
                  {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ID number</label>
                <input
                  value={form.idNumber}
                  onChange={e => setForm({ ...form, idNumber: e.target.value })}
                  placeholder="Enter your ID number"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🪪 Your ID will be verified at the venue entrance. Make sure it matches your physical ID.
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('code')} style={{ ...ghostBtn }}>← Back</button>
              <button
                onClick={handleRedeem}
                disabled={loading || !form.attendeeName || !form.idNumber}
                style={{ ...accentBtn, flex: 1, padding: '13px', opacity: (loading || !form.attendeeName || !form.idNumber) ? 0.5 : 1 }}
              >
                {loading ? 'Claiming ticket...' : 'Claim ticket'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && result && (
          <div style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎟️</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, color: 'var(--green)' }}>
              Ticket claimed!
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
              Your ticket for <strong style={{ color: 'var(--text)' }}>{result.eventTitle}</strong> has been transferred and bound to your ID.
            </p>
            <Link href="/tickets">
              <button style={{ ...accentBtn, width: '100%', padding: '13px' }}>
                View my tickets →
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: '0.85rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '11px 14px',
  color: 'var(--text)',
  fontSize: '0.95rem',
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  background: 'rgba(255,71,87,0.1)',
  border: '1px solid var(--red)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--red)',
  fontSize: '0.875rem',
  marginBottom: 16,
}

const accentBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '11px 20px',
  fontFamily: 'Syne',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
}