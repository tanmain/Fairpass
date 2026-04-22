import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>
          fair<span style={{ color: 'var(--accent)' }}>pass</span>
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login">
            <button style={ghostBtn}>Log in</button>
          </Link>
          <Link href="/register">
            <button style={accentBtn}>Get started</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,255,71,0.07) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-60%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-block',
            background: 'rgba(232,255,71,0.1)',
            color: 'var(--accent)',
            border: '1px solid rgba(232,255,71,0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          Anti-scalping · ID-bound tickets
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            maxWidth: 800,
            marginBottom: 24,
            lineHeight: 1.05,
          }}
        >
          Tickets that belong
          <br />
          <span style={{ color: 'var(--accent)' }}>to real fans.</span>
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            maxWidth: 520,
            marginBottom: 48,
            lineHeight: 1.7,
          }}
        >
          Every ticket is bound to a government ID. No bots. No resellers. No inflated prices.
          Just you, your ticket, and the show.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/events">
            <button style={{ ...accentBtn, fontSize: '1rem', padding: '14px 32px' }}>
              Browse events
            </button>
          </Link>
          <Link href="/register?role=ORGANIZER">
            <button style={{ ...ghostBtn, fontSize: '1rem', padding: '14px 32px' }}>
              I'm an organizer →
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 1,
          borderTop: '1px solid var(--border)',
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              padding: '32px 28px',
              borderRight: i < features.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </section>
    </main>
  )
}

const features = [
  { icon: '🪪', title: 'ID-bound tickets', desc: 'Each ticket is tied to a real government ID. Verified at the door.' },
  { icon: '⚡', title: 'Fair queuing', desc: 'Virtual queue system ensures equal access for high-demand events.' },
  { icon: '🔁', title: 'Safe resale', desc: 'Transfer at face value only — zero markup, zero scalping.' },
  { icon: '🎵', title: 'Verified fan pre-sale', desc: 'Spotify-verified listeners get priority access. Coming soon.' },
]

const accentBtn: React.CSSProperties = {
  background: 'var(--accent)',
  color: '#0a0a0f',
  border: 'none',
  borderRadius: 8,
  padding: '10px 22px',
  fontFamily: 'Syne',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  letterSpacing: '-0.01em',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 22px',
  fontFamily: 'Syne',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
}