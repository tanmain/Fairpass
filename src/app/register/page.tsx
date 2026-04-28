'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
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
    router.push(data.user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/')
  }

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="page-container" style={{ maxWidth: 560 }}>
        <div className="panel">
          <Link href="/" className="button button-secondary" style={{ width: 'fit-content', marginBottom: 24 }}>Back home</Link>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span style={dotStyle('var(--accent-2)')} />
            <span>Create account</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>Join FairPass</h1>
          <p className="muted" style={{ marginBottom: 22 }}>Choose your role and create an account with a simpler, more focused onboarding flow.</p>

          <div className="card-soft" style={{ padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
            {(['ATTENDEE', 'ORGANIZER'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={form.role === role ? 'button button-primary' : 'button button-secondary'}
                style={{ width: '100%' }}
              >
                {role === 'ATTENDEE' ? 'Attendee' : 'Organizer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="label">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" required minLength={2} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" required minLength={8} className="input" />
            </div>

            {error && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>{error}</div>}

            <button type="submit" disabled={loading} className="button button-primary button-full" style={{ minHeight: 50 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="muted" style={{ marginTop: 18, textAlign: 'center' }}>
            Already have an account? <Link href="/login" className="text-accent">Sign in</Link>
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
