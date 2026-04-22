import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrganizer, getSession } from '@/lib/auth'
import { z } from 'zod'

const CreateEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  venue: z.string().min(2),
  city: z.string().min(2),
  eventDate: z.string().datetime(),
  totalInventory: z.number().int().positive(),
  ticketPrice: z.number().positive(),
  maxTicketsPerID: z.number().int().min(1).max(10).default(2),
  gracePeriodHours: z.number().int().min(1).max(72).default(6),
  penaltyPercent: z.number().min(0).max(50).default(20),
  isHighDemand: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

// GET /api/events
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')
  const mine = searchParams.get('mine') === 'true'

  const session = await getSession()

  const where: any = {}

  if (mine && session?.role === 'ORGANIZER') {
    where.organizerId = session.userId
  } else {
    where.status = 'PUBLISHED'
  }

  if (city) where.city = { contains: city, mode: 'insensitive' }

  const events = await prisma.event.findMany({
    where,
    orderBy: { eventDate: 'asc' },
    include: {
      organizer: { select: { name: true } },
      _count: { select: { tickets: true } },
    },
  })

  return NextResponse.json({ events })
}

// POST /api/events
export async function POST(req: NextRequest) {
  try {
    const session = await requireOrganizer()
    const body = await req.json()
    const data = CreateEventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        ...data,
        availableInventory: data.totalInventory,
        organizerId: session.userId,
        status: 'PUBLISHED',
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (err.name === 'ZodError') return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 })
    console.error('[CreateEvent]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}