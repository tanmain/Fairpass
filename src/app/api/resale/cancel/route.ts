import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { cancelResaleListing } from '@/lib/resaleService'
import { z } from 'zod'

const CancelSchema = z.object({
  listingId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = CancelSchema.parse(body)

    const result = await cancelResaleListing({
      listingId: data.listingId,
      sellerId: session.userId,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      FORBIDDEN: ['Not your listing', 403],
      LISTING_NOT_ACTIVE: ['This listing is no longer active', 400],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResaleCancel]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
