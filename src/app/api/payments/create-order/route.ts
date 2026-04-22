import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { createRazorpayOrder } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { PaymentType, ResaleListingStatus } from '@prisma/client'
import { z } from 'zod'

const CreateOrderSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PRIMARY_PURCHASE'),
    eventId: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
  }),
  z.object({
    type: z.literal('RESALE_PURCHASE'),
    listingId: z.string().min(1),
  }),
])

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = CreateOrderSchema.parse(body)

    let amountPaise: number
    let receipt: string
    let notes: Record<string, string>
    let eventId: string | undefined
    let quantity: number | undefined
    let listingId: string | undefined

    if (data.type === 'PRIMARY_PURCHASE') {
      const event = await prisma.event.findUniqueOrThrow({ where: { id: data.eventId } })
      if (event.availableInventory < data.quantity) {
        return NextResponse.json({ error: 'Not enough tickets available' }, { status: 409 })
      }
      if (data.quantity > event.maxTicketsPerID) {
        return NextResponse.json({ error: 'Maximum tickets per purchase exceeded' }, { status: 400 })
      }
      amountPaise = Math.round(event.ticketPrice * data.quantity * 100)
      receipt = `evt-${data.eventId.slice(-8)}-${Date.now()}`
      notes = { type: 'PRIMARY_PURCHASE', eventId: data.eventId, quantity: String(data.quantity) }
      eventId = data.eventId
      quantity = data.quantity
    } else {
      const listing = await prisma.resaleListing.findUniqueOrThrow({
        where: { id: data.listingId },
        include: { ticket: { include: { event: true } } },
      })
      if (listing.status !== ResaleListingStatus.ACTIVE) {
        return NextResponse.json({ error: 'This listing is no longer available' }, { status: 410 })
      }
      if (new Date() > listing.expiresAt) {
        return NextResponse.json({ error: 'This listing has expired' }, { status: 410 })
      }
      if (listing.sellerId === session.userId) {
        return NextResponse.json({ error: 'You cannot purchase your own listing' }, { status: 400 })
      }
      const totalAmount = listing.faceValue + listing.convenienceFee
      amountPaise = Math.round(totalAmount * 100)
      receipt = `resale-${data.listingId.slice(-8)}-${Date.now()}`
      notes = { type: 'RESALE_PURCHASE', listingId: data.listingId }
      listingId = data.listingId
    }

    const razorpayOrder = await createRazorpayOrder(amountPaise, receipt, notes)

    await prisma.paymentOrder.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        userId: session.userId,
        type: data.type as PaymentType,
        amountPaise,
        eventId,
        quantity,
        listingId,
      },
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    console.error('[CreateOrder]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
