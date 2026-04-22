import { prisma } from './prisma'
import { createQRToken, hashIDForEvent } from './auth'
import { TicketStatus, ResaleListingStatus, ResaleMode } from '@prisma/client'
import {
  RESALE_CONVENIENCE_FEE_PERCENT,
  RESALE_PLATFORM_FEE_PERCENT,
  RESALE_CUTOFF_HOURS,
  PRIVATE_LISTING_CLAIM_HOURS,
} from './resaleConstants'

// ─── Create resale listing ───────────────────────────────────────────────────

export async function createResaleListing({
  ticketId,
  sellerId,
  mode,
  targetBuyerEmail,
}: {
  ticketId: string
  sellerId: string
  mode: 'PRIVATE' | 'PUBLIC'
  targetBuyerEmail?: string
}) {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: { event: true, resaleListings: { where: { status: ResaleListingStatus.ACTIVE } } },
  })

  if (ticket.userId !== sellerId) throw new Error('FORBIDDEN')
  if (ticket.status !== TicketStatus.BOUND) throw new Error('TICKET_NOT_BOUND')
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')
  if (ticket.resaleListings.length > 0) throw new Error('ALREADY_LISTED')

  const hoursUntilEvent = (new Date(ticket.event.eventDate).getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntilEvent <= RESALE_CUTOFF_HOURS) throw new Error('TOO_CLOSE_TO_EVENT')

  let targetBuyerId: string | null = null
  if (mode === 'PRIVATE') {
    if (!targetBuyerEmail) throw new Error('TARGET_EMAIL_REQUIRED')
    const targetUser = await prisma.user.findUnique({ where: { email: targetBuyerEmail } })
    if (!targetUser) throw new Error('TARGET_USER_NOT_FOUND')
    if (targetUser.id === sellerId) throw new Error('CANNOT_TARGET_SELF')
    targetBuyerId = targetUser.id
  }

  const faceValue = ticket.event.ticketPrice
  const convenienceFee = faceValue * (RESALE_CONVENIENCE_FEE_PERCENT / 100)
  const platformFee = faceValue * (RESALE_PLATFORM_FEE_PERCENT / 100)
  const sellerPayout = faceValue - platformFee

  const expiresAt = mode === 'PRIVATE'
    ? new Date(Date.now() + PRIVATE_LISTING_CLAIM_HOURS * 60 * 60 * 1000)
    : new Date(ticket.event.eventDate.getTime() - RESALE_CUTOFF_HOURS * 60 * 60 * 1000)

  const [listing] = await prisma.$transaction([
    prisma.resaleListing.create({
      data: {
        ticketId,
        sellerId,
        targetBuyerId,
        mode,
        status: ResaleListingStatus.ACTIVE,
        faceValue,
        convenienceFee,
        platformFee,
        sellerPayout,
        expiresAt,
      },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.LISTED },
    }),
  ])

  return { listing, targetBuyerId }
}

// ─── Purchase resale listing ─────────────────────────────────────────────────

export async function purchaseResaleListing({
  listingId,
  buyerId,
  attendeeName,
  idType,
  idNumber,
}: {
  listingId: string
  buyerId: string
  attendeeName: string
  idType: string
  idNumber: string
}) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
    include: { ticket: { include: { event: true } } },
  })

  if (listing.status !== ResaleListingStatus.ACTIVE) throw new Error('LISTING_NOT_ACTIVE')
  if (new Date() > listing.expiresAt) throw new Error('LISTING_EXPIRED')
  if (listing.sellerId === buyerId) throw new Error('CANNOT_BUY_OWN_LISTING')
  if (listing.mode === ResaleMode.PRIVATE && listing.targetBuyerId !== buyerId) {
    throw new Error('NOT_TARGET_BUYER')
  }

  const ticket = listing.ticket
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')

  const idHash = hashIDForEvent(idNumber, ticket.eventId)
  const existingIdUsage = await prisma.eventIDUsage.findUnique({
    where: { eventId_idNumber: { eventId: ticket.eventId, idNumber: idHash } },
  })
  if (existingIdUsage) throw new Error('ID_ALREADY_USED_FOR_EVENT')

  const oldIdHash = hashIDForEvent(ticket.idNumber!, ticket.eventId)

  const idLast4 = idNumber.slice(-4)
  const qrToken = createQRToken({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    attendeeName,
    idType,
    idLast4,
    issuedAt: Date.now(),
  })

  const buyerPaymentRef = `RESALE-BUY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const sellerPayoutRef = `RESALE-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  await prisma.$transaction([
    prisma.eventIDUsage.deleteMany({
      where: { eventId: ticket.eventId, idNumber: oldIdHash },
    }),
    prisma.eventIDUsage.create({
      data: { eventId: ticket.eventId, idNumber: idHash },
    }),
    prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        userId: buyerId,
        attendeeName,
        idType,
        idNumber,
        idBoundAt: new Date(),
        status: TicketStatus.BOUND,
        qrToken,
        qrGeneratedAt: new Date(),
        transferCount: { increment: 1 },
        lastTransferAt: new Date(),
      },
    }),
    prisma.resaleListing.update({
      where: { id: listingId },
      data: {
        status: ResaleListingStatus.SOLD,
        buyerId,
        purchasedAt: new Date(),
      },
    }),
  ])

  return {
    eventTitle: ticket.event.title,
    faceValue: listing.faceValue,
    convenienceFee: listing.convenienceFee,
    sellerPayout: listing.sellerPayout,
    buyerPaymentRef,
    sellerPayoutRef,
  }
}

// ─── Cancel resale listing ───────────────────────────────────────────────────

export async function cancelResaleListing({
  listingId,
  sellerId,
}: {
  listingId: string
  sellerId: string
}) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
  })

  if (listing.sellerId !== sellerId) throw new Error('FORBIDDEN')
  if (listing.status !== ResaleListingStatus.ACTIVE) throw new Error('LISTING_NOT_ACTIVE')

  await prisma.$transaction([
    prisma.resaleListing.update({
      where: { id: listingId },
      data: { status: ResaleListingStatus.CANCELLED },
    }),
    prisma.ticket.update({
      where: { id: listing.ticketId },
      data: { status: TicketStatus.BOUND },
    }),
  ])

  return { success: true }
}

// ─── Expire listing if needed ────────────────────────────────────────────────

export async function expireListingIfNeeded(listingId: string) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
  })

  if (listing.status !== ResaleListingStatus.ACTIVE) return listing
  if (new Date() <= listing.expiresAt) return listing

  await prisma.$transaction([
    prisma.resaleListing.update({
      where: { id: listingId },
      data: { status: ResaleListingStatus.EXPIRED },
    }),
    prisma.ticket.update({
      where: { id: listing.ticketId },
      data: { status: TicketStatus.BOUND },
    }),
  ])

  return { ...listing, status: ResaleListingStatus.EXPIRED }
}

// ─── Get resale listing ──────────────────────────────────────────────────────

export async function getResaleListing(listingId: string, userId?: string) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
    include: {
      ticket: {
        include: {
          event: {
            select: { title: true, venue: true, city: true, eventDate: true, ticketPrice: true },
          },
        },
      },
      seller: { select: { name: true } },
    },
  })

  if (listing.status === ResaleListingStatus.ACTIVE && new Date() > listing.expiresAt) {
    await expireListingIfNeeded(listing.id)
    return { ...listing, status: ResaleListingStatus.EXPIRED }
  }

  if (listing.mode === ResaleMode.PRIVATE) {
    if (userId !== listing.sellerId && userId !== listing.targetBuyerId) {
      throw new Error('FORBIDDEN')
    }
  }

  return listing
}

// ─── Discovery listings ──────────────────────────────────────────────────────

export async function getDiscoveryListings(filters?: { eventId?: string; city?: string }) {
  const where: any = {
    mode: ResaleMode.PUBLIC,
    status: ResaleListingStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  }

  if (filters?.eventId) {
    where.ticket = { eventId: filters.eventId }
  }
  if (filters?.city) {
    where.ticket = { ...where.ticket, event: { city: filters.city } }
  }

  return prisma.resaleListing.findMany({
    where,
    include: {
      ticket: {
        include: {
          event: {
            select: { id: true, title: true, venue: true, city: true, eventDate: true, ticketPrice: true, imageUrl: true },
          },
        },
      },
      seller: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}
