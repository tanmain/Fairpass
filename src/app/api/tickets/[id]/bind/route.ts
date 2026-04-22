import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { bindIDToTicket } from '@/lib/ticketService'
import { z } from 'zod'
import QRCode from 'qrcode'

const BindIDSchema = z.object({
  attendeeName: z.string().min(2),
  idType: z.enum(['AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']),
  idNumber: z.string().min(4),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = BindIDSchema.parse(body)

    const ticket = await bindIDToTicket({
      ticketId: params.id,
      userId: session.userId,
      ...data,
    })

    const qrDataURL = ticket.qrToken
      ? await QRCode.toDataURL(ticket.qrToken, { errorCorrectionLevel: 'H', width: 300 })
      : null

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        status: ticket.status,
        attendeeName: ticket.attendeeName,
        idType: ticket.idType,
        idBoundAt: ticket.idBoundAt,
        qrDataURL,
      },
    })
  } catch (err: any) {
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      FORBIDDEN: ['Not your ticket', 403],
      ALREADY_BOUND: ['ID already bound to this ticket', 409],
      TICKET_INVALID: ['This ticket has been invalidated', 410],
      TICKET_ALREADY_USED: ['This ticket has already been used', 410],
      GRACE_PERIOD_EXPIRED: ['Grace period has expired', 410],
      ID_ALREADY_USED_FOR_EVENT: ['This ID has already been used for this event', 409],
    }

    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[BindID]', err)
    return NextResponse.json({ error: message }, { status })
  }
}