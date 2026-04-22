import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { purchaseTickets, getUserTickets } from '@/lib/ticketService'
import { schedulePenaltyJob } from '@/worker/penaltyWorker'
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