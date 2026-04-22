import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { generateTransferCode } from '@/lib/ticketService'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const ticket = await generateTransferCode(params.id, session.userId)

    return NextResponse.json({
      transferCode: ticket.transferCode,
      expiresAt: ticket.transferCodeExpiresAt,
    })
  } catch (err: any) {
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      FORBIDDEN: ['Not your ticket', 403],
      TICKET_NOT_BOUND: ['Ticket must be ID-bound before transferring', 400],
      MAX_TRANSFERS_REACHED: ['This ticket has already been transferred the maximum number of times', 400],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[GenerateTransferCode]', err)
    return NextResponse.json({ error: message }, { status })
  }
}