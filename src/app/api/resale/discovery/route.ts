import { NextRequest, NextResponse } from 'next/server'
import { getDiscoveryListings } from '@/lib/resaleService'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId') || undefined
    const city = searchParams.get('city') || undefined

    const listings = await getDiscoveryListings({ eventId, city })

    return NextResponse.json({ listings })
  } catch (err: any) {
    console.error('[ResaleDiscovery]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
