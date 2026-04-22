import { Worker, Queue } from 'bullmq'
import { applyGracePeriodPenalty } from '../lib/ticketService'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}

export const penaltyQueue = new Queue('grace-period-penalty', { connection })
export const reminderQueue = new Queue('grace-period-reminder', { connection })

// ─── Enqueue a penalty job at purchase time ───────────────────────────────────

export async function schedulePenaltyJob(purchaseId: string, delayMs: number) {
  await penaltyQueue.add(
    'apply-penalty',
    { purchaseId },
    {
      delay: delayMs,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      jobId: `penalty-${purchaseId}`,
    }
  )
  console.log(`[PenaltyQueue] Scheduled penalty for purchase ${purchaseId} in ${delayMs}ms`)
}

// ─── Enqueue a reminder job (1 hour before grace period expires) ──────────────

export async function scheduleReminderJob(purchaseId: string, delayMs: number) {
  await reminderQueue.add(
    'send-reminder',
    { purchaseId },
    {
      delay: delayMs,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      jobId: `reminder-${purchaseId}`,
    }
  )
  console.log(`[ReminderQueue] Scheduled reminder for purchase ${purchaseId} in ${delayMs}ms`)
}

// ─── Worker (run as separate process) ────────────────────────────────────────

if (require.main === module) {
  // Penalty worker
  const penaltyWorker = new Worker(
    'grace-period-penalty',
    async (job) => {
      const { purchaseId } = job.data
      console.log(`[PenaltyWorker] Processing penalty for purchase: ${purchaseId}`)
      const result = await applyGracePeriodPenalty(purchaseId)
      if (result) {
        console.log(
          `[PenaltyWorker] ✅ Applied penalty — ₹${result.penaltyApplied} retained, ` +
          `₹${result.refundAmount} refunded, ${result.invalidatedTickets} tickets invalidated`
        )
      } else {
        console.log(`[PenaltyWorker] ✅ No unbound tickets — nothing to penalize`)
      }
    },
    { connection }
  )

  penaltyWorker.on('failed', (job, err) => {
    console.error(`[PenaltyWorker] ❌ Job ${job?.id} failed:`, err)
  })

  // Reminder worker
  const reminderWorker = new Worker(
    'grace-period-reminder',
    async (job) => {
      const { purchaseId } = job.data
      console.log(`[ReminderWorker] Sending reminder for purchase: ${purchaseId}`)

      const { prisma } = await import('../lib/prisma')
      const { sendGracePeriodReminder } = await import('../lib/emailService')
      const { TicketStatus } = await import('@prisma/client')

      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          user: true,
          event: true,
          tickets: true,
        },
      })

      if (!purchase) return

      const unboundCount = purchase.tickets.filter(
        t => t.status === TicketStatus.PENDING_ID
      ).length

      if (unboundCount === 0) {
        console.log(`[ReminderWorker] ✅ All tickets bound — skipping reminder`)
        return
      }

      await sendGracePeriodReminder({
        to: purchase.user.email,
        name: purchase.user.name,
        eventTitle: purchase.event.title,
        idDeadline: purchase.idDeadline.toISOString(),
        penaltyPercent: purchase.event.penaltyPercent,
        ticketCount: unboundCount,
      })

      console.log(`[ReminderWorker] ✅ Reminder sent to ${purchase.user.email}`)
    },
    { connection }
  )

  reminderWorker.on('failed', (job, err) => {
    console.error(`[ReminderWorker] ❌ Job ${job?.id} failed:`, err)
  })

  console.log('[Workers] 🚀 Penalty + Reminder workers started!')
}