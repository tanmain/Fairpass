import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// GET /api/auth/me
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('session')
  return response
}