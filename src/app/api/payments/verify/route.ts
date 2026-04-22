import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { purchaseTickets } from '@/lib/ticketService'
import { purchaseResaleListing } from '@/lib/resaleService'
import { sendPurchaseConfirmation, sendResaleSoldNotification, sendResalePurchaseConfirmation } from '@/lib/emailService'
import { PaymentOrderStatus } from '@prisma/client'
import { z } from 'zod'

const VerifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  // For resale purchases — ID binding details
  attendeeName: z.string().min(2).optional(),
  idType: z.enum(['AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']).optional(),
  idNumber: z.string().min(4).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = VerifySchema.parse(body)

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    )
    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Look up the payment order
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: data.razorpayOrderId },
    })
    if (!paymentOrder) {
      return NextResponse.json({ error: 'Payment order not found' }, { status: 404 })
    }
    if (paymentOrder.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (paymentOrder.status === PaymentOrderStatus.COMPLETED) {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 409 })
    }

    let result: any

    if (paymentOrder.type === 'PRIMARY_PURCHASE') {
      // Execute primary purchase
      const { purchase, tickets, event } = await purchaseTickets({
        userId: session.userId,
        eventId: paymentOrder.eventId!,
        quantity: paymentOrder.quantity!,
      })

      // Update payment order
      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: PaymentOrderStatus.COMPLETED,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          purchaseId: purchase.id,
        },
      })

      // Store razorpay payment ID on purchase for refunds
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { razorpayPaymentId: data.razorpayPaymentId },
      })

      // Send confirmation email (fire and forget)
      const user = await prisma.user.findUnique({ where: { id: session.userId } })
      if (user) {
        sendPurchaseConfirmation({
          to: user.email,
          name: user.name,
          eventTitle: event.title,
          eventDate: event.eventDate.toISOString(),
          eventVenue: event.venue,
          quantity: paymentOrder.quantity!,
          totalAmount: purchase.totalAmount,
          paymentRef: purchase.paymentRef,
          idDeadline: purchase.idDeadline.toISOString(),
          gracePeriodHours: event.gracePeriodHours,
          penaltyPercent: event.penaltyPercent,
        }).catch(err => console.error('[VerifyPayment] Email error:', err))
      }

      result = {
        type: 'PRIMARY_PURCHASE',
        purchase: {
          id: purchase.id,
          paymentRef: purchase.paymentRef,
          idDeadline: purchase.idDeadline,
          totalAmount: purchase.totalAmount,
        },
        tickets: tickets.map(t => ({ id: t.id, status: t.status })),
        gracePeriodHours: event.gracePeriodHours,
      }
    } else {
      // Execute resale purchase
      if (!data.attendeeName || !data.idType || !data.idNumber) {
        return NextResponse.json({ error: 'ID details required for resale purchase' }, { status: 400 })
      }

      const resaleResult = await purchaseResaleListing({
        listingId: paymentOrder.listingId!,
        buyerId: session.userId,
        attendeeName: data.attendeeName,
        idType: data.idType,
        idNumber: data.idNumber,
      })

      // Update payment order
      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: PaymentOrderStatus.COMPLETED,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
        },
      })

      // Send emails (fire and forget)
      const listing = await prisma.resaleListing.findUniqueOrThrow({
        where: { id: paymentOrder.listingId! },
        include: {
          seller: { select: { email: true, name: true } },
          ticket: { include: { event: true } },
        },
      })

      sendResaleSoldNotification({
        to: listing.seller.email,
        name: listing.seller.name,
        eventTitle: resaleResult.eventTitle,
        eventDate: listing.ticket.event.eventDate.toISOString(),
        sellerPayout: resaleResult.sellerPayout,
      }).catch(err => console.error('[VerifyPayment] Seller email error:', err))

      sendResalePurchaseConfirmation({
        to: session.email,
        name: session.name,
        eventTitle: resaleResult.eventTitle,
        eventDate: listing.ticket.event.eventDate.toISOString(),
        eventVenue: `${listing.ticket.event.venue}, ${listing.ticket.event.city}`,
        totalPaid: resaleResult.faceValue + resaleResult.convenienceFee,
      }).catch(err => console.error('[VerifyPayment] Buyer email error:', err))

      result = {
        type: 'RESALE_PURCHASE',
        eventTitle: resaleResult.eventTitle,
        faceValue: resaleResult.faceValue,
        convenienceFee: resaleResult.convenienceFee,
      }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      NOT_ENOUGH_TICKETS: ['Not enough tickets available — you will be refunded', 409],
      LISTING_NOT_ACTIVE: ['This listing is no longer available', 410],
      LISTING_EXPIRED: ['This listing has expired', 410],
      ID_ALREADY_USED_FOR_EVENT: ['This ID has already been used for this event', 409],
      NOT_TARGET_BUYER: ['This listing is reserved for a specific buyer', 403],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[VerifyPayment]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
