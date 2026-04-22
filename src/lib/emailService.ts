import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'FairPass <onboarding@resend.dev>'

// ─── Purchase confirmation ────────────────────────────────────────────────────

export async function sendPurchaseConfirmation({
  to,
  name,
  eventTitle,
  eventDate,
  eventVenue,
  quantity,
  totalAmount,
  paymentRef,
  idDeadline,
  gracePeriodHours,
  penaltyPercent,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  quantity: number
  totalAmount: number
  paymentRef: string
  idDeadline: string
  gracePeriodHours: number
  penaltyPercent: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your tickets for ${eventTitle} — Action required`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">Tickets purchased! 🎟️</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, your purchase is confirmed.</p>

        <div style="background: #111118; border: 1px solid #2a2a38; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">${eventTitle}</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.8;">
            📍 ${eventVenue}<br/>
            📅 ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            🎟 ${quantity} ticket${quantity > 1 ? 's' : ''}<br/>
            💰 ₹${totalAmount.toLocaleString('en-IN')} total<br/>
            🧾 Ref: ${paymentRef}
          </div>
        </div>

        <div style="background: rgba(255,159,67,0.1); border: 1px solid rgba(255,159,67,0.3); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="color: #ff9f43; font-weight: 700; margin-bottom: 8px;">⚠️ Action required within ${gracePeriodHours} hours</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.6;">
            You must bind a government ID to each ticket before:<br/>
            <strong style="color: #f0f0f8;">${new Date(idDeadline).toLocaleString('en-IN')}</strong><br/><br/>
            Unbound tickets will be invalidated and a <strong style="color: #ff4757;">${penaltyPercent}% penalty fee</strong> will be retained.
          </div>
        </div>

        <a href="${process.env.NEXTAUTH_URL}/tickets" style="display: block; background: #e8ff47; color: #0a0a0f; text-align: center; padding: 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 24px;">
          Bind ID to my tickets →
        </a>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}

// ─── Grace period reminder (1 hour before expiry) ─────────────────────────────

export async function sendGracePeriodReminder({
  to,
  name,
  eventTitle,
  idDeadline,
  penaltyPercent,
  ticketCount,
}: {
  to: string
  name: string
  eventTitle: string
  idDeadline: string
  penaltyPercent: number
  ticketCount: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `⏱ 1 hour left to bind your ID — ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">⏱ 1 hour left!</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, your ID binding deadline is almost here.</p>

        <div style="background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.3); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="color: #ff4757; font-weight: 700; margin-bottom: 8px;">🚨 Urgent — act now</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.6;">
            You have <strong style="color: #f0f0f8;">${ticketCount} unbound ticket${ticketCount > 1 ? 's' : ''}</strong> for <strong style="color: #f0f0f8;">${eventTitle}</strong>.<br/><br/>
            Deadline: <strong style="color: #ff4757;">${new Date(idDeadline).toLocaleString('en-IN')}</strong><br/><br/>
            After this time, unbound tickets will be invalidated and a <strong style="color: #ff4757;">${penaltyPercent}% penalty</strong> will be retained.
          </div>
        </div>

        <a href="${process.env.NEXTAUTH_URL}/tickets" style="display: block; background: #e8ff47; color: #0a0a0f; text-align: center; padding: 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 24px;">
          Bind ID now →
        </a>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}

// ─── ID bound confirmation ────────────────────────────────────────────────────

export async function sendIDBindConfirmation({
  to,
  name,
  eventTitle,
  eventDate,
  eventVenue,
  attendeeName,
  idType,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  attendeeName: string
  idType: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ You're all set for ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">You're all set! ✅</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, your ticket is confirmed and ready to use.</p>

        <div style="background: #111118; border: 1px solid #2a2a38; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">${eventTitle}</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.8;">
            📍 ${eventVenue}<br/>
            📅 ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            🪪 Bound to: <strong style="color: #f0f0f8;">${attendeeName}</strong> (${idType})
          </div>
        </div>

        <div style="background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; color: #2ecc71; font-size: 0.875rem;">
          ✓ Your QR code is ready. Show it at the venue entrance along with your physical ID.
        </div>

        <a href="${process.env.NEXTAUTH_URL}/tickets" style="display: block; background: #e8ff47; color: #0a0a0f; text-align: center; padding: 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 24px;">
          View QR code →
        </a>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}