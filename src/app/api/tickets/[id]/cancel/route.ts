import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketStatus } from '@prisma/client'
import { createRazorpayRefund } from '@/lib/razorpay'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        purchase: true,
        event: { select: { ticketPrice: true, penaltyPercent: true } },
      },
    })

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    if (ticket.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (ticket.status !== TicketStatus.PENDING_ID) {
      return NextResponse.json({ error: 'Only unbound tickets can be cancelled' }, { status: 400 })
    }

    const penaltyAmount = (ticket.event.penaltyPercent / 100) * ticket.event.ticketPrice
    const refundAmount = ticket.event.ticketPrice - penaltyAmount

    await prisma.$transaction([
      // Mark ticket as refunded
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.REFUNDED },
      }),
      // Return inventory
      prisma.event.update({
        where: { id: ticket.eventId },
        data: { availableInventory: { increment: 1 } },
      }),
      // Record on purchase
      prisma.purchase.update({
        where: { id: ticket.purchaseId },
        data: {
          penaltyRetained: { increment: penaltyAmount },
          refundAmount: { increment: refundAmount },
        },
      }),
    ])

    // Issue Razorpay refund if payment was made via Razorpay
    if (ticket.purchase.razorpayPaymentId) {
      try {
        await createRazorpayRefund(
          ticket.purchase.razorpayPaymentId,
          Math.round(refundAmount * 100) // convert to paise
        )
      } catch (refundErr) {
        console.error('[CancelTicket] Razorpay refund failed:', refundErr)
        // Don't block the cancellation — refund can be retried manually
      }
    }

    return NextResponse.json({
      ok: true,
      penaltyAmount,
      refundAmount,
      penaltyPercent: ticket.event.penaltyPercent,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    console.error('[CancelTicket]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}