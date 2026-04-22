import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { purchaseTickets, getUserTickets } from '@/lib/ticketService'
import { schedulePenaltyJob, scheduleReminderJob } from '@/worker/penaltyWorker'
import { z } from 'zod'

const PurchaseSchema = z.object({
  eventId: z.string(),
  quantity: z.number().int().min(1).max(10),
})

// POST /api/tickets
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const { eventId, quantity } = PurchaseSchema.parse(body)

    const { purchase, tickets, event } = await purchaseTickets({
      userId: session.userId,
      eventId,
      quantity,
    })

    const delayMs = event.gracePeriodHours * 60 * 60 * 1000
    try {
      await schedulePenaltyJob(purchase.id, delayMs)
    } catch (redisErr) {
      console.warn('[Tickets] Could not schedule penalty job (Redis unavailable?):', redisErr)
    }

    // Schedule 1 hour reminder (grace period minus 1 hour)
    const reminderDelayMs = delayMs - 60 * 60 * 1000
    if (reminderDelayMs > 0) {
      try {
        await scheduleReminderJob(purchase.id, reminderDelayMs)
      } catch (redisErr) {
        console.warn('[Tickets] Could not schedule reminder job:', redisErr)
      }
    }

    // Send purchase confirmation email
    try {
      const user = await import('@/lib/prisma').then(m => m.prisma.user.findUnique({ where: { id: session.userId } }))
      if (user) {
        await import('@/lib/emailService').then(m => m.sendPurchaseConfirmation({
          to: user.email,
          name: user.name,
          eventTitle: event.title,
          eventDate: event.eventDate.toISOString(),
          eventVenue: event.venue,
          quantity,
          totalAmount: purchase.totalAmount,
          paymentRef: purchase.paymentRef,
          idDeadline: purchase.idDeadline.toISOString(),
          gracePeriodHours: event.gracePeriodHours,
          penaltyPercent: event.penaltyPercent,
        }))
      }
    } catch (emailErr) {
      console.warn('[Tickets] Could not send confirmation email:', emailErr)
    }

    return NextResponse.json(
      {
        purchase: {
          id: purchase.id,
          paymentRef: purchase.paymentRef,
          idDeadline: purchase.idDeadline,
          totalAmount: purchase.totalAmount,
        },
        tickets: tickets.map((t) => ({ id: t.id, status: t.status })),
        gracePeriodHours: event.gracePeriodHours,
      },
      { status: 201 }
    )
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    if (err.message === 'NOT_ENOUGH_TICKETS') return NextResponse.json({ error: 'Not enough tickets available' }, { status: 409 })
    if (err.message?.startsWith('MAX_')) return NextResponse.json({ error: 'Maximum tickets per purchase exceeded' }, { status: 400 })
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    console.error('[PurchaseTickets]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/tickets
export async function GET() {
  try {
    const session = await requireSession()
    const tickets = await getUserTickets(session.userId)
    return NextResponse.json({ tickets })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}