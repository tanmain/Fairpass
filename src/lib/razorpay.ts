import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpayInstance: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return razorpayInstance
}

export async function createRazorpayOrder(amountPaise: number, receipt: string, notes?: Record<string, string>) {
  return getRazorpay().orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
  })
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export async function createRazorpayRefund(paymentId: string, amountPaise: number) {
  return (getRazorpay().payments as any).refund(paymentId, {
    amount: amountPaise,
  })
}
