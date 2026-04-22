import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { createResaleListing } from '@/lib/resaleService'
import { sendPrivateListingNotification } from '@/lib/emailService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ListSchema = z.object({
  ticketId: z.string().min(1),
  mode: z.enum(['PRIVATE', 'PUBLIC']),
  targetBuyerEmail: z.string().email().optional(),
}).refine(
  (data) => data.mode !== 'PRIVATE' || !!data.targetBuyerEmail,
  { message: 'targetBuyerEmail is required for private listings', path: ['targetBuyerEmail'] }
)

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = ListSchema.parse(body)

    const { listing, targetBuyerId } = await createResaleListing({
      ticketId: data.ticketId,
      sellerId: session.userId,
      mode: data.mode,
      targetBuyerEmail: data.targetBuyerEmail,
    })

    // Send notification for private listings
    if (data.mode === 'PRIVATE' && targetBuyerId) {
      const [targetUser, seller, ticket] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: targetBuyerId } }),
        prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
        prisma.ticket.findUniqueOrThrow({
          where: { id: data.ticketId },
          include: { event: true },
        }),
      ])

      sendPrivateListingNotification({
        to: targetUser.email,
        name: targetUser.name,
        sellerName: seller.name,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.eventDate.toISOString(),
        eventVenue: `${ticket.event.venue}, ${ticket.event.city}`,
        faceValue: listing.faceValue,
        convenienceFee: listing.convenienceFee,
        listingId: listing.id,
        expiresAt: listing.expiresAt.toISOString(),
      }).catch((err) => console.error('[ResaleListEmail]', err))
    }

    return NextResponse.json({ listing })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      FORBIDDEN: ['Not your ticket', 403],
      TICKET_NOT_BOUND: ['Ticket must be ID-bound before listing for resale', 400],
      MAX_TRANSFERS_REACHED: ['This ticket has reached the maximum number of transfers', 400],
      ALREADY_LISTED: ['This ticket is already listed for resale', 409],
      TOO_CLOSE_TO_EVENT: ['Cannot list for resale within 24 hours of the event', 400],
      TARGET_EMAIL_REQUIRED: ['Recipient email is required for private listings', 400],
      TARGET_USER_NOT_FOUND: ['No registered user found with that email', 404],
      CANNOT_TARGET_SELF: ['You cannot list a ticket for yourself', 400],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResaleList]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
