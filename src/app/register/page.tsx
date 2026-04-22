'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'ORGANIZER' ? 'ORGANIZER' : 'ATTENDEE'

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Registration failed')
      return
    }

    if (data.user.role === 'ORGANIZER') {
      router.push('/organizer/dashboard')
    } else {
      router.push('/events')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back</Link>

        <h1 style={{ fontFamily: 'Syne', fontSize: '1.8rem', marginTop: 24, marginBottom: 8 }}>
          Create account
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
          Join FairPass and get fair access to the shows you love.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'var(--surface-2)', padding: 4, borderRadius: 10 }}>
          {(['ATTENDEE', 'ORGANIZER'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ ...form, role })}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 7,
                border: 'none',
                fontFamily: 'Syne',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: form.role === role ? 'var(--accent)' : 'transparent',
                color: form.role === role ? '#0a0a0f' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {role === 'ATTENDEE' ? '🎟 Fan' : '🎪 Organizer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Rahul Sharma"
              required
              minLength={2}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 characters"
              required
              minLength={8}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: 'var(--bg)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '40px 36px',
  width: '100%',
  maxWidth: 420,
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

const submitBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  padding: '12px',
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: 4,
}