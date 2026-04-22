'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }
    router.push(data.user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/')
  }

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="page-container" style={{ maxWidth: 520 }}>
        <div className="panel">
          <Link href="/" className="button button-secondary" style={{ width: 'fit-content', marginBottom: 24 }}>Back home</Link>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Sign in</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>Welcome back</h1>
          <p className="muted" style={{ marginBottom: 22 }}>Use your FairPass account to continue to events, tickets, or organizer tools.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required className="input" />
            </div>

            {error && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>{error}</div>}

            <button type="submit" disabled={loading} className="button button-primary button-full" style={{ minHeight: 50 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="card-soft" style={{ padding: 16, marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Demo accounts</div>
            <div className="muted">Fan: `fan@demo.com` / `password123`</div>
            <div className="muted">Organizer: `organizer@demo.com` / `password123`</div>
          </div>

          <p className="muted" style={{ marginTop: 18, textAlign: 'center' }}>
            Don&apos;t have an account? <Link href="/register" className="text-accent">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
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
