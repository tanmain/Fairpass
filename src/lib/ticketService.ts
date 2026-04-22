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
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Generate transfer code ───────────────────────────────────────────────────

export async function generateTransferCode(ticketId: string, userId: string) {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
  })

  if (ticket.userId !== userId) throw new Error('FORBIDDEN')
  if (ticket.status !== 'BOUND') throw new Error('TICKET_NOT_BOUND')
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')
  if (ticket.transferCode && ticket.transferCodeExpiresAt && new Date() < ticket.transferCodeExpiresAt && !ticket.transferCodeUsed) {
    // Return existing valid code instead of generating a new one
    return ticket
  }

  // Generate 8-digit numeric code
  const code = Math.floor(10000000 + Math.random() * 90000000).toString()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      transferCode: code,
      transferCodeExpiresAt: expiresAt,
      transferCodeUsed: false,
    },
  })
}

// ─── Redeem transfer code ─────────────────────────────────────────────────────

export async function redeemTransferCode({
  code,
  buyerId,
  attendeeName,
  idType,
  idNumber,
}: {
  code: string
  buyerId: string
  attendeeName: string
  idType: string
  idNumber: string
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { transferCode: code },
    include: { event: true },
  })

  if (!ticket) throw new Error('INVALID_CODE')
  if (ticket.transferCodeUsed) throw new Error('CODE_ALREADY_USED')
  if (!ticket.transferCodeExpiresAt || new Date() > ticket.transferCodeExpiresAt) throw new Error('CODE_EXPIRED')
  if (ticket.userId === buyerId) throw new Error('CANNOT_TRANSFER_TO_SELF')
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')

  // Check if buyer's ID is already used for this event
  const idHash = hashIDForEvent(idNumber, ticket.eventId)
  const existing = await prisma.eventIDUsage.findUnique({
    where: { eventId_idNumber: { eventId: ticket.eventId, idNumber: idHash } },
  })
  if (existing) throw new Error('ID_ALREADY_USED_FOR_EVENT')

  // Generate new QR for the new owner
  const { createQRToken } = await import('./auth')
  const idLast4 = idNumber.slice(-4)
  const qrToken = createQRToken({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    attendeeName,
    idType,
    idLast4,
    issuedAt: Date.now(),
  })

  // Remove old ID usage, add new one, rebind ticket
  const oldIdHash = hashIDForEvent(ticket.idNumber!, ticket.eventId)

  await prisma.$transaction([
    // Remove old ID usage
    prisma.eventIDUsage.deleteMany({
      where: { eventId: ticket.eventId, idNumber: oldIdHash },
    }),
    // Add new ID usage
    prisma.eventIDUsage.create({
      data: { eventId: ticket.eventId, idNumber: idHash },
    }),
    // Rebind ticket to new owner
    prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        userId: buyerId,
        attendeeName,
        idType,
        idNumber,
        idBoundAt: new Date(),
        status: 'BOUND',
        qrToken,
        qrGeneratedAt: new Date(),
        transferCode: null,
        transferCodeExpiresAt: null,
        transferCodeUsed: true,
        transferCount: { increment: 1 },
        lastTransferAt: new Date(),
      },
    }),
  ])

  return { success: true, eventTitle: ticket.event.title }
}