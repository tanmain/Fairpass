import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applyGracePeriodPenalty } from '@/lib/ticketService'
import { sendGracePeriodReminder } from '@/lib/emailService'
import { TicketStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  // 1. Apply penalties for expired grace periods
  const expiredPurchases = await prisma.purchase.findMany({
    where: {
      idDeadline: { lte: now },
      penaltyApplied: false,
    },
    select: { id: true },
  })

  let penaltiesApplied = 0
  for (const purchase of expiredPurchases) {
    try {
      const result = await applyGracePeriodPenalty(purchase.id)
      if (result) penaltiesApplied++
    } catch (err) {
      console.error(`[Cron] Failed to apply penalty for purchase ${purchase.id}:`, err)
    }
  }

  // 2. Send reminders for deadlines within 1 hour
  const reminderPurchases = await prisma.purchase.findMany({
    where: {
      idDeadline: { gt: now, lte: oneHourFromNow },
      penaltyApplied: false,
      reminderSentAt: null,
      tickets: { some: { status: TicketStatus.PENDING_ID } },
    },
    include: {
      user: { select: { email: true, name: true } },
      event: { select: { title: true, penaltyPercent: true } },
      tickets: { where: { status: TicketStatus.PENDING_ID } },
    },
  })

  let remindersSent = 0
  for (const purchase of reminderPurchases) {
    try {
      await sendGracePeriodReminder({
        to: purchase.user.email,
        name: purchase.user.name,
        eventTitle: purchase.event.title,
        idDeadline: purchase.idDeadline.toISOString(),
        penaltyPercent: purchase.event.penaltyPercent,
        ticketCount: purchase.tickets.length,
      })
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { reminderSentAt: now },
      })
      remindersSent++
    } catch (err) {
      console.error(`[Cron] Failed to send reminder for purchase ${purchase.id}:`, err)
    }
  }

  return NextResponse.json({
    processed: {
      penaltiesApplied,
      remindersSent,
      expiredChecked: expiredPurchases.length,
      remindersChecked: reminderPurchases.length,
    },
    timestamp: now.toISOString(),
  })
}
