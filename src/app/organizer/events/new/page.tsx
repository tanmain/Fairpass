'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    city: '',
    eventDate: '',
    totalInventory: 1000,
    ticketPrice: 1500,
    maxTicketsPerID: 2,
    gracePeriodHours: 6,
    penaltyPercent: 20,
    isHighDemand: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Failed to create event'); return }
    router.push('/organizer/dashboard')
  }

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link href="/organizer/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Dashboard</Link>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          fair<span style={{ color: 'var(--accent)' }}>pass</span>
        </span>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Create event</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Publish an event and configure ID-binding rules.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <Section title="Event details">
            <Field label="Event title">
              <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Arijit Singh Live — Mumbai" required style={inputStyle} />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={3} placeholder="A short description..." style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Venue">
                <input value={form.venue} onChange={e => f('venue', e.target.value)} placeholder="MMRDA Grounds, BKC" required style={inputStyle} />
              </Field>
              <Field label="City">
                <input value={form.city} onChange={e => f('city', e.target.value)} placeholder="Mumbai" required style={inputStyle} />
              </Field>
            </div>
            <Field label="Event date & time">
              <input type="datetime-local" value={form.eventDate} onChange={e => f('eventDate', e.target.value)} required style={inputStyle} />
            </Field>
          </Section>

          <Section title="Ticket configuration">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Total inventory">
                <input type="number" value={form.totalInventory} onChange={e => f('totalInventory', parseInt(e.target.value))} min={1} required style={inputStyle} />
              </Field>
              <Field label="Ticket price (₹)">
                <input type="number" value={form.ticketPrice} onChange={e => f('ticketPrice', parseFloat(e.target.value))} min={1} step="0.01" required style={inputStyle} />
              </Field>
              <Field label="Max tickets per ID">
                <input type="number" value={form.maxTicketsPerID} onChange={e => f('maxTicketsPerID', parseInt(e.target.value))} min={1} max={10} required style={inputStyle} />
              </Field>
              <Field label="Grace period (hours)">
                <input type="number" value={form.gracePeriodHours} onChange={e => f('gracePeriodHours', parseInt(e.target.value))} min={1} max={72} required style={inputStyle} />
              </Field>
            </div>

            <Field label={`Penalty fee (${form.penaltyPercent}% of ticket price retained)`}>
              <input
                type="range"
                value={form.penaltyPercent}
                onChange={e => f('penaltyPercent', parseFloat(e.target.value))}
                min={5} max={50} step={5}
                style={{ width: '100%', accentColor: 'var(--accent)' } as React.CSSProperties}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>5%</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {form.penaltyPercent}% (₹{(form.ticketPrice * form.penaltyPercent / 100).toFixed(0)} per ticket)
                </span>
                <span>50%</span>
              </div>
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 8 }}>
              <input
                type="checkbox"
                id="highDemand"
                checked={form.isHighDemand}
                onChange={e => f('isHighDemand', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' } as React.CSSProperties}
              />
              <label htmlFor="highDemand" style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>⚡ High demand event</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Enables virtual queue at purchase time</div>
              </label>
            </div>
          </Section>

          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--red)', borderRadius: 8, padding: '12px 16px', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...accentBtn, padding: '14px', fontSize: '1rem' }}>
            {loading ? 'Publishing...' : 'Publish event'}
          </button>

        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 20, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
}

const accentBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  fontFamily: 'Syne',
  fontWeight: 700,
  cursor: 'pointer',
  width: '100%',
}