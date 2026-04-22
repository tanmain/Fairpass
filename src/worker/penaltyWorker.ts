import { Worker, Queue } from 'bullmq'
import { applyGracePeriodPenalty } from '../lib/ticketService'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}

export const penaltyQueue = new Queue('grace-period-penalty', { connection })

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

// ─── Worker (run as separate process) ────────────────────────────────────────

if (require.main === module) {
  const worker = new Worker(
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

  worker.on('failed', (job, err) => {
    console.error(`[PenaltyWorker] ❌ Job ${job?.id} failed:`, err)
  })

  console.log('[PenaltyWorker] 🚀 Worker started, waiting for jobs...')
}