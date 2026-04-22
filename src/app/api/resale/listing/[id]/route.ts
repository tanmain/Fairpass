import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getResaleListing } from '@/lib/resaleService'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    const listing = await getResaleListing(params.id, session?.userId)

    return NextResponse.json({ listing })
  } catch (err: any) {
    const errorMap: Record<string, [string, number]> = {
      FORBIDDEN: ['You do not have access to this listing', 403],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResaleListingDetail]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
