'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', description: '', venue: '', city: '', eventDate: '',
    totalInventory: 1000, ticketPrice: 1500, maxTicketsPerID: 2,
    gracePeriodHours: 6, penaltyPercent: 20, isHighDemand: false, imageUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')
    setImagePreview(URL.createObjectURL(file))
    setImageUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setImageUploading(false)
    if (!res.ok) {
      setImageError(data.error || 'Upload failed')
      setImagePreview(null)
      return
    }
    setForm(prev => ({ ...prev, imageUrl: data.url }))
  }

  function removeImage() {
    setImagePreview(null)
    setForm(prev => ({ ...prev, imageUrl: '' }))
    setImageError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, eventDate: new Date(form.eventDate).toISOString() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to create event')
      return
    }
    router.push('/organizer/dashboard')
  }

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/organizer/dashboard" className="button button-secondary">Dashboard</Link>
        <span className="brand">fair<span className="brand-accent">pass</span></span>
      </nav>

      <main className="page-container page-section" style={{ maxWidth: 980 }}>
        <section className="hero-panel" style={{ padding: 28, marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            <span style={dotStyle('var(--accent)')} />
            <span>Create event</span>
          </div>
          <h1 className="section-heading" style={{ marginBottom: 12 }}>Publish a new event with a calmer, clearer organizer workflow.</h1>
          <p className="section-copy">The form now feels more editorial and less cramped, while still keeping all the ticketing controls visible.</p>
        </section>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
          <Section title="Cover image">
            <input id="img-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} style={{ display: 'none' }} />
            {!imagePreview ? (
              <label htmlFor="img-upload" className="card-soft" style={{ padding: 36, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' }}>
                <div className="badge badge-cyan" style={{ marginBottom: 12 }}>Poster upload</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Add a cover image</h3>
                <p className="muted">JPEG, PNG, WebP, or GIF up to 5 MB.</p>
              </label>
            ) : (
              <div className="card-soft" style={{ padding: 14 }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 18, display: 'block' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <span className="muted">{imageUploading ? 'Uploading image...' : 'Image ready'}</span>
                  {!imageUploading && <button type="button" onClick={removeImage} className="button button-danger">Remove image</button>}
                </div>
              </div>
            )}
            {imageError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>{imageError}</div>}
          </Section>

          <Section title="Event details">
            <Field label="Event title">
              <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Arijit Singh Live - Mumbai" required className="input" />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={4} placeholder="Describe the event, atmosphere, or lineup." className="textarea" />
            </Field>
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <Field label="Venue">
                <input value={form.venue} onChange={e => f('venue', e.target.value)} placeholder="MMRDA Grounds" required className="input" />
              </Field>
              <Field label="City">
                <input value={form.city} onChange={e => f('city', e.target.value)} placeholder="Mumbai" required className="input" />
              </Field>
            </div>
            <Field label="Event date and time">
              <input type="datetime-local" value={form.eventDate} onChange={e => f('eventDate', e.target.value)} required className="input" />
            </Field>
          </Section>

          <Section title="Ticket configuration">
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <Field label="Total inventory">
                <input type="number" value={form.totalInventory} onChange={e => f('totalInventory', parseInt(e.target.value))} min={1} required className="input" />
              </Field>
              <Field label="Ticket price (Rs)">
                <input type="number" value={form.ticketPrice} onChange={e => f('ticketPrice', parseFloat(e.target.value))} min={1} step="0.01" required className="input" />
              </Field>
              <Field label="Max tickets per ID">
                <input type="number" value={form.maxTicketsPerID} onChange={e => f('maxTicketsPerID', parseInt(e.target.value))} min={1} max={10} required className="input" />
              </Field>
              <Field label="Grace period (hours)">
                <input type="number" value={form.gracePeriodHours} onChange={e => f('gracePeriodHours', parseInt(e.target.value))} min={1} max={72} required className="input" />
              </Field>
            </div>
            <Field label={`Penalty fee - ${form.penaltyPercent}% retained on cancel`}>
              <input
                type="range"
                value={form.penaltyPercent}
                onChange={e => f('penaltyPercent', parseFloat(e.target.value))}
                min={5}
                max={50}
                step={5}
                style={{ width: '100%', accentColor: 'var(--accent)' } as React.CSSProperties}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                <span className="muted">5%</span>
                <span className="badge badge-accent">{form.penaltyPercent}% | Rs {(form.ticketPrice * form.penaltyPercent / 100).toFixed(0)} retained per ticket</span>
                <span className="muted">50%</span>
              </div>
            </Field>
            <div className="card-soft" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="checkbox"
                id="highDemand"
                checked={form.isHighDemand}
                onChange={e => f('isHighDemand', e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)' } as React.CSSProperties}
              />
              <label htmlFor="highDemand" style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 700 }}>High demand event</div>
                <div className="muted">Highlights the event and enables virtual queue messaging.</div>
              </label>
            </div>
          </Section>

          {error && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px' }}>{error}</div>}

          <button type="submit" disabled={loading || imageUploading} className="button button-primary button-full" style={{ minHeight: 52 }}>
            {imageUploading ? 'Waiting for image...' : loading ? 'Publishing...' : 'Publish event'}
          </button>
        </form>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel">
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        <span style={dotStyle('var(--accent-2)')} />
        <span>{title}</span>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
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
