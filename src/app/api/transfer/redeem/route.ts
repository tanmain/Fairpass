import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { redeemTransferCode } from '@/lib/ticketService'
import { z } from 'zod'

const RedeemSchema = z.object({
  code: z.string().length(8),
  attendeeName: z.string().min(2),
  idType: z.enum(['AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']),
  idNumber: z.string().min(4),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = RedeemSchema.parse(body)

    const result = await redeemTransferCode({
      code: data.code,
      buyerId: session.userId,
      attendeeName: data.attendeeName,
      idType: data.idType,
      idNumber: data.idNumber,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      INVALID_CODE: ['Invalid transfer code', 404],
      CODE_ALREADY_USED: ['This transfer code has already been used', 409],
      CODE_EXPIRED: ['This transfer code has expired', 410],
      CANNOT_TRANSFER_TO_SELF: ['You cannot transfer a ticket to yourself', 400],
      MAX_TRANSFERS_REACHED: ['This ticket cannot be transferred anymore', 400],
      ID_ALREADY_USED_FOR_EVENT: ['This ID has already been used for this event', 409],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[RedeemTransfer]', err)
    return NextResponse.json({ error: message }, { status })
  }
}