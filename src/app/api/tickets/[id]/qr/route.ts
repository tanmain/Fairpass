import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { event: { select: { title: true } } },
    })

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    if (ticket.userId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (ticket.status !== 'BOUND') return NextResponse.json({ error: 'Ticket not bound yet' }, { status: 400 })
    if (!ticket.qrToken) return NextResponse.json({ error: 'No QR token found' }, { status: 400 })

    const qrDataURL = await QRCode.toDataURL(ticket.qrToken, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    })

    return NextResponse.json({
      qrDataURL,
      attendeeName: ticket.attendeeName,
      eventTitle: ticket.event.title,
      idType: ticket.idType,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}