import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { purchaseResaleListing } from '@/lib/resaleService'
import { sendResaleSoldNotification, sendResalePurchaseConfirmation } from '@/lib/emailService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PurchaseSchema = z.object({
  listingId: z.string().min(1),
  attendeeName: z.string().min(2),
  idType: z.enum(['AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']),
  idNumber: z.string().min(4),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = PurchaseSchema.parse(body)

    const result = await purchaseResaleListing({
      listingId: data.listingId,
      buyerId: session.userId,
      attendeeName: data.attendeeName,
      idType: data.idType,
      idNumber: data.idNumber,
    })

    // Send emails (fire and forget)
    const listing = await prisma.resaleListing.findUniqueOrThrow({
      where: { id: data.listingId },
      include: {
        seller: { select: { email: true, name: true } },
        ticket: { include: { event: true } },
      },
    })

    sendResaleSoldNotification({
      to: listing.seller.email,
      name: listing.seller.name,
      eventTitle: result.eventTitle,
      eventDate: listing.ticket.event.eventDate.toISOString(),
      sellerPayout: result.sellerPayout,
    }).catch((err) => console.error('[ResaleSoldEmail]', err))

    sendResalePurchaseConfirmation({
      to: session.email,
      name: session.name,
      eventTitle: result.eventTitle,
      eventDate: listing.ticket.event.eventDate.toISOString(),
      eventVenue: `${listing.ticket.event.venue}, ${listing.ticket.event.city}`,
      totalPaid: result.faceValue + result.convenienceFee,
    }).catch((err) => console.error('[ResalePurchaseEmail]', err))

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      LISTING_NOT_ACTIVE: ['This listing is no longer available', 410],
      LISTING_EXPIRED: ['This listing has expired', 410],
      CANNOT_BUY_OWN_LISTING: ['You cannot purchase your own listing', 400],
      NOT_TARGET_BUYER: ['This listing is reserved for a specific buyer', 403],
      MAX_TRANSFERS_REACHED: ['This ticket cannot be transferred anymore', 400],
      ID_ALREADY_USED_FOR_EVENT: ['This ID has already been used for this event', 409],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResalePurchase]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
