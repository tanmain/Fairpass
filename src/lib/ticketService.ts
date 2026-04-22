import { prisma } from './prisma'
import { createQRToken, hashIDForEvent } from './auth'
import { TicketStatus } from '@prisma/client'

// ─── Purchase tickets ─────────────────────────────────────────────────────────

export async function purchaseTickets({
  userId,
  eventId,
  quantity,
}: {
  userId: string
  eventId: string
  quantity: number
}) {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } })

  if (event.availableInventory < quantity) {
    throw new Error('NOT_ENOUGH_TICKETS')
  }

  if (quantity > event.maxTicketsPerID) {
    throw new Error(`MAX_${event.maxTicketsPerID}_TICKETS_PER_PURCHASE`)
  }

  const totalAmount = event.ticketPrice * quantity
  const gracePeriodMs = event.gracePeriodHours * 60 * 60 * 1000
  const idDeadline = new Date(Date.now() + gracePeriodMs)

  const result = await prisma.$transaction(async (tx) => {
    const updatedEvent = await tx.event.update({
      where: { id: eventId, availableInventory: { gte: quantity } },
      data: { availableInventory: { decrement: quantity } },
    })

    const purchase = await tx.purchase.create({
      data: {
        userId,
        eventId,
        quantity,
        totalAmount,
        idDeadline,
        paymentRef: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    })

    const tickets = await Promise.all(
      Array.from({ length: quantity }).map(() =>
        tx.ticket.create({
          data: {
            purchaseId: purchase.id,
            eventId,
            userId,
            status: TicketStatus.PENDING_ID,
          },
        })
      )
    )

    return { purchase, tickets, event: updatedEvent }
  })

  return result
}

// ─── Bind ID to ticket ────────────────────────────────────────────────────────

export async function bindIDToTicket({
  ticketId,
  userId,
  attendeeName,
  idType,
  idNumber,
}: {
  ticketId: string
  userId: string
  attendeeName: string
  idType: string
  idNumber: string
}) {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: { purchase: true, event: true },
  })

  if (ticket.userId !== userId) throw new Error('FORBIDDEN')
  if (ticket.status === TicketStatus.BOUND) throw new Error('ALREADY_BOUND')
  if (ticket.status === TicketStatus.INVALID) throw new Error('TICKET_INVALID')
  if (ticket.status === TicketStatus.USED) throw new Error('TICKET_ALREADY_USED')

  if (new Date() > ticket.purchase.idDeadline) {
    throw new Error('GRACE_PERIOD_EXPIRED')
  }

  const idHash = hashIDForEvent(idNumber, ticket.eventId)
  const existing = await prisma.eventIDUsage.findUnique({
    where: { eventId_idNumber: { eventId: ticket.eventId, idNumber: idHash } },
  })
  if (existing) throw new Error('ID_ALREADY_USED_FOR_EVENT')

  const idLast4 = idNumber.slice(-4)
  const qrToken = createQRToken({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    attendeeName,
    idType,
    idLast4,
    issuedAt: Date.now(),
  })

  const [updatedTicket] = await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        attendeeName,
        idType,
        idNumber,
        idBoundAt: new Date(),
        status: TicketStatus.BOUND,
        qrToken,
        qrGeneratedAt: new Date(),
      },
    }),
    prisma.eventIDUsage.create({
      data: { eventId: ticket.eventId, idNumber: idHash },
    }),
  ])

  return updatedTicket
}

// ─── Apply penalty ────────────────────────────────────────────────────────────

export async function applyGracePeriodPenalty(purchaseId: string) {
  const purchase = await prisma.purchase.findUniqueOrThrow({
    where: { id: purchaseId },
    include: { tickets: true, event: true },
  })

  if (purchase.penaltyApplied) return

  const unboundTickets = purchase.tickets.filter(
    (t) => t.status === TicketStatus.PENDING_ID
  )

  if (unboundTickets.length === 0) return

  const penaltyPerTicket =
    (purchase.event.penaltyPercent / 100) * purchase.event.ticketPrice
  const totalPenalty = penaltyPerTicket * unboundTickets.length
  const refundAmount = purchase.event.ticketPrice * unboundTickets.length - totalPenalty

  await prisma.$transaction([
    prisma.ticket.updateMany({
      where: { id: { in: unboundTickets.map((t) => t.id) } },
      data: { status: TicketStatus.INVALID },
    }),
    prisma.event.update({
      where: { id: purchase.eventId },
      data: { availableInventory: { increment: unboundTickets.length } },
    }),
    prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        penaltyApplied: true,
        penaltyRetained: totalPenalty,
        refundAmount,
      },
    }),
  ])

  return { penaltyApplied: totalPenalty, refundAmount, invalidatedTickets: unboundTickets.length }
}

// ─── Get user tickets ─────────────────────────────────────────────────────────

export async function getUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    include: {
      event: { select: { title: true, venue: true, city: true, eventDate: true, ticketPrice: true, penaltyPercent: true } },
      purchase: { select: { idDeadline: true, paymentRef: true } },
      resaleListings: {
        where: { status: 'ACTIVE' },
        select: { id: true, mode: true, status: true, faceValue: true, sellerPayout: true, expiresAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
