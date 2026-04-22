import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret'
const QR_SECRET = process.env.QR_JWT_SECRET || 'dev-qr-secret'

// ─── Password helpers ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Session token ────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string
  email: string
  role: string
  name: string
}

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: '7d' })
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireOrganizer(): Promise<SessionPayload> {
  const session = await requireSession()
  if (session.role !== 'ORGANIZER' && session.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return session
}

// ─── QR Token ────────────────────────────────────────────────────────────────

export interface QRPayload {
  ticketId: string
  eventId: string
  attendeeName: string
  idType: string
  idLast4: string
  issuedAt: number
}

export function createQRToken(payload: QRPayload): string {
  return jwt.sign(payload, QR_SECRET)
}

export function verifyQRToken(token: string): QRPayload | null {
  try {
    return jwt.verify(token, QR_SECRET) as QRPayload
  } catch {
    return null
  }
}

// ─── ID hashing ───────────────────────────────────────────────────────────────

export function hashIDForEvent(idNumber: string, eventId: string): string {
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', eventId)
    .update(idNumber.toLowerCase().replace(/\s/g, ''))
    .digest('hex')
}