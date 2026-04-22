# Resale Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing transfer code system with a dual-mode (private/public) resale marketplace where tickets are resold at face value with ID rebinding.

**Architecture:** New `ResaleListing` model with its own lifecycle (ACTIVE -> SOLD/EXPIRED/CANCELLED), separate from Ticket status. Resale service layer handles all business logic (listing, purchasing, cancellation, lazy expiry). Old transfer code fields and routes are fully removed.

**Tech Stack:** Next.js 14 API routes, Prisma ORM, PostgreSQL, Resend email, TypeScript, Zod validation.

**Spec:** `docs/superpowers/specs/2026-04-22-resale-marketplace-design.md`

---

## File Map

**Create:**
- `src/lib/resaleConstants.ts` — Hardcoded fee/timing constants
- `src/lib/resaleService.ts` — Core resale business logic (list, purchase, cancel, expiry)
- `src/app/api/resale/list/route.ts` — Create listing endpoint
- `src/app/api/resale/discovery/route.ts` — Public discovery endpoint
- `src/app/api/resale/listing/[id]/route.ts` — Single listing detail endpoint
- `src/app/api/resale/purchase/route.ts` — Purchase/atomic swap endpoint
- `src/app/api/resale/cancel/route.ts` — Cancel listing endpoint
- `src/app/resale/page.tsx` — Discovery browse page
- `src/app/resale/claim/[id]/page.tsx` — Private claim page

**Modify:**
- `prisma/schema.prisma` — Add enums, ResaleListing model, update Ticket
- `src/lib/emailService.ts` — Add 3 new email templates
- `src/app/tickets/page.tsx` — Replace transfer UI with resale UI
- `src/app/layout.tsx` — No change needed (no global nav component exists)
- `src/app/events/page.tsx` — Add "Resale" nav link
- `src/app/page.tsx` — Add "Resale" nav link

**Delete:**
- `src/app/api/tickets/[id]/transfer/route.ts` — Old transfer code generation
- `src/app/api/transfer/redeem/route.ts` — Old transfer code redemption
- `src/app/api/transfer/page.tsx` — Old transfer redeem page

**Modify (cleanup only):**
- `src/lib/ticketService.ts` — Remove `generateTransferCode()` and `redeemTransferCode()`

---

### Task 1: Database Schema Changes

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new enums and ResaleListing model to schema**

Add these enums after the existing `EventStatus` enum:

```prisma
enum ResaleListingStatus {
  ACTIVE
  SOLD
  EXPIRED
  CANCELLED
}

enum ResaleMode {
  PRIVATE
  PUBLIC
}
```

Add the `ResaleListing` model after the `Ticket` model:

```prisma
model ResaleListing {
  id              String              @id @default(cuid())
  ticketId        String
  sellerId        String
  targetBuyerId   String?
  buyerId         String?
  mode            ResaleMode
  status          ResaleListingStatus @default(ACTIVE)
  faceValue       Float
  convenienceFee  Float
  platformFee     Float
  sellerPayout    Float
  expiresAt       DateTime
  purchasedAt     DateTime?

  ticket          Ticket              @relation(fields: [ticketId], references: [id])
  seller          User                @relation("ResaleListings", fields: [sellerId], references: [id])
  targetBuyer     User?               @relation("ResaleTargets", fields: [targetBuyerId], references: [id])
  buyer           User?               @relation("ResalePurchases", fields: [buyerId], references: [id])

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@map("resale_listings")
}
```

- [ ] **Step 2: Update the TicketStatus enum**

Add `LISTED` to the existing `TicketStatus` enum:

```prisma
enum TicketStatus {
  PENDING_ID
  BOUND
  LISTED
  INVALID
  TRANSFERRED
  USED
  REFUNDED
}
```

- [ ] **Step 3: Update the Ticket model**

Remove these three fields from the Ticket model:

```prisma
  // REMOVE these lines:
  transferCode          String?   @unique
  transferCodeExpiresAt DateTime?
  transferCodeUsed      Boolean   @default(false)
```

Add the resale listing relation (no FK column needed — the relation is owned by ResaleListing):

```prisma
  resaleListings  ResaleListing[]
```

- [ ] **Step 4: Add User model relations for resale**

Add these three relations to the User model, after the existing `tickets` relation:

```prisma
  resaleListings    ResaleListing[] @relation("ResaleListings")
  resaleTargets     ResaleListing[] @relation("ResaleTargets")
  resalePurchases   ResaleListing[] @relation("ResalePurchases")
```

- [ ] **Step 5: Push schema changes to the database**

Run: `npx prisma db push`

Expected: Schema synced successfully. If there are existing rows with `transferCode` data, the column drop may require confirmation — accept it.

- [ ] **Step 6: Regenerate Prisma client**

Run: `npx prisma generate`

Expected: Prisma client regenerated with new types.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add ResaleListing model, LISTED status, remove transfer code fields"
```

---

### Task 2: Constants File

**Files:**
- Create: `src/lib/resaleConstants.ts`

- [ ] **Step 1: Create the constants file**

```typescript
export const RESALE_CONVENIENCE_FEE_PERCENT = 5
export const RESALE_PLATFORM_FEE_PERCENT = 5
export const RESALE_CUTOFF_HOURS = 24
export const PRIVATE_LISTING_CLAIM_HOURS = 2
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/resaleConstants.ts
git commit -m "feat(resale): add resale constants"
```

---

### Task 3: Resale Service Layer

**Files:**
- Create: `src/lib/resaleService.ts`

- [ ] **Step 1: Create resale service with `createResaleListing` function**

```typescript
import { prisma } from './prisma'
import { createQRToken, hashIDForEvent } from './auth'
import { TicketStatus, ResaleListingStatus, ResaleMode } from '@prisma/client'
import {
  RESALE_CONVENIENCE_FEE_PERCENT,
  RESALE_PLATFORM_FEE_PERCENT,
  RESALE_CUTOFF_HOURS,
  PRIVATE_LISTING_CLAIM_HOURS,
} from './resaleConstants'

export async function createResaleListing({
  ticketId,
  sellerId,
  mode,
  targetBuyerEmail,
}: {
  ticketId: string
  sellerId: string
  mode: 'PRIVATE' | 'PUBLIC'
  targetBuyerEmail?: string
}) {
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: { event: true, resaleListings: { where: { status: ResaleListingStatus.ACTIVE } } },
  })

  if (ticket.userId !== sellerId) throw new Error('FORBIDDEN')
  if (ticket.status !== TicketStatus.BOUND) throw new Error('TICKET_NOT_BOUND')
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')
  if (ticket.resaleListings.length > 0) throw new Error('ALREADY_LISTED')

  const hoursUntilEvent = (new Date(ticket.event.eventDate).getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntilEvent <= RESALE_CUTOFF_HOURS) throw new Error('TOO_CLOSE_TO_EVENT')

  let targetBuyerId: string | null = null
  if (mode === 'PRIVATE') {
    if (!targetBuyerEmail) throw new Error('TARGET_EMAIL_REQUIRED')
    const targetUser = await prisma.user.findUnique({ where: { email: targetBuyerEmail } })
    if (!targetUser) throw new Error('TARGET_USER_NOT_FOUND')
    if (targetUser.id === sellerId) throw new Error('CANNOT_TARGET_SELF')
    targetBuyerId = targetUser.id
  }

  const faceValue = ticket.event.ticketPrice
  const convenienceFee = faceValue * (RESALE_CONVENIENCE_FEE_PERCENT / 100)
  const platformFee = faceValue * (RESALE_PLATFORM_FEE_PERCENT / 100)
  const sellerPayout = faceValue - platformFee

  const expiresAt = mode === 'PRIVATE'
    ? new Date(Date.now() + PRIVATE_LISTING_CLAIM_HOURS * 60 * 60 * 1000)
    : new Date(ticket.event.eventDate.getTime() - RESALE_CUTOFF_HOURS * 60 * 60 * 1000)

  const [listing] = await prisma.$transaction([
    prisma.resaleListing.create({
      data: {
        ticketId,
        sellerId,
        targetBuyerId,
        mode,
        status: ResaleListingStatus.ACTIVE,
        faceValue,
        convenienceFee,
        platformFee,
        sellerPayout,
        expiresAt,
      },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.LISTED },
    }),
  ])

  return { listing, targetBuyerId }
}
```

- [ ] **Step 2: Verify the service compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No errors related to `resaleService.ts`. Fix any type issues before proceeding.

- [ ] **Step 3: Add `purchaseResaleListing` function**

Append to `src/lib/resaleService.ts`:

```typescript
export async function purchaseResaleListing({
  listingId,
  buyerId,
  attendeeName,
  idType,
  idNumber,
}: {
  listingId: string
  buyerId: string
  attendeeName: string
  idType: string
  idNumber: string
}) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
    include: { ticket: { include: { event: true } } },
  })

  if (listing.status !== ResaleListingStatus.ACTIVE) throw new Error('LISTING_NOT_ACTIVE')
  if (new Date() > listing.expiresAt) throw new Error('LISTING_EXPIRED')
  if (listing.sellerId === buyerId) throw new Error('CANNOT_BUY_OWN_LISTING')
  if (listing.mode === ResaleMode.PRIVATE && listing.targetBuyerId !== buyerId) {
    throw new Error('NOT_TARGET_BUYER')
  }

  const ticket = listing.ticket
  if (ticket.transferCount >= ticket.maxTransfers) throw new Error('MAX_TRANSFERS_REACHED')

  // Check buyer's ID isn't already used for this event
  const idHash = hashIDForEvent(idNumber, ticket.eventId)
  const existingIdUsage = await prisma.eventIDUsage.findUnique({
    where: { eventId_idNumber: { eventId: ticket.eventId, idNumber: idHash } },
  })
  if (existingIdUsage) throw new Error('ID_ALREADY_USED_FOR_EVENT')

  // Void old ID usage
  const oldIdHash = hashIDForEvent(ticket.idNumber!, ticket.eventId)

  // Generate new QR
  const idLast4 = idNumber.slice(-4)
  const qrToken = createQRToken({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    attendeeName,
    idType,
    idLast4,
    issuedAt: Date.now(),
  })

  // Stubbed payment refs
  const buyerPaymentRef = `RESALE-BUY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const sellerPayoutRef = `RESALE-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  await prisma.$transaction([
    // Remove old ID usage
    prisma.eventIDUsage.deleteMany({
      where: { eventId: ticket.eventId, idNumber: oldIdHash },
    }),
    // Add new ID usage
    prisma.eventIDUsage.create({
      data: { eventId: ticket.eventId, idNumber: idHash },
    }),
    // Rebind ticket to new owner
    prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        userId: buyerId,
        attendeeName,
        idType,
        idNumber,
        idBoundAt: new Date(),
        status: TicketStatus.BOUND,
        qrToken,
        qrGeneratedAt: new Date(),
        transferCount: { increment: 1 },
        lastTransferAt: new Date(),
      },
    }),
    // Mark listing as sold
    prisma.resaleListing.update({
      where: { id: listingId },
      data: {
        status: ResaleListingStatus.SOLD,
        buyerId,
        purchasedAt: new Date(),
      },
    }),
  ])

  return {
    eventTitle: ticket.event.title,
    faceValue: listing.faceValue,
    convenienceFee: listing.convenienceFee,
    sellerPayout: listing.sellerPayout,
    buyerPaymentRef,
    sellerPayoutRef,
  }
}
```

- [ ] **Step 4: Add `cancelResaleListing` function**

Append to `src/lib/resaleService.ts`:

```typescript
export async function cancelResaleListing({
  listingId,
  sellerId,
}: {
  listingId: string
  sellerId: string
}) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
  })

  if (listing.sellerId !== sellerId) throw new Error('FORBIDDEN')
  if (listing.status !== ResaleListingStatus.ACTIVE) throw new Error('LISTING_NOT_ACTIVE')

  await prisma.$transaction([
    prisma.resaleListing.update({
      where: { id: listingId },
      data: { status: ResaleListingStatus.CANCELLED },
    }),
    prisma.ticket.update({
      where: { id: listing.ticketId },
      data: { status: TicketStatus.BOUND },
    }),
  ])

  return { success: true }
}
```

- [ ] **Step 5: Add `getResaleListing` and `expireListingIfNeeded` functions**

Append to `src/lib/resaleService.ts`:

```typescript
export async function expireListingIfNeeded(listingId: string) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
  })

  if (listing.status !== ResaleListingStatus.ACTIVE) return listing
  if (new Date() <= listing.expiresAt) return listing

  await prisma.$transaction([
    prisma.resaleListing.update({
      where: { id: listingId },
      data: { status: ResaleListingStatus.EXPIRED },
    }),
    prisma.ticket.update({
      where: { id: listing.ticketId },
      data: { status: TicketStatus.BOUND },
    }),
  ])

  return { ...listing, status: ResaleListingStatus.EXPIRED }
}

export async function getResaleListing(listingId: string, userId?: string) {
  const listing = await prisma.resaleListing.findUniqueOrThrow({
    where: { id: listingId },
    include: {
      ticket: {
        include: {
          event: {
            select: { title: true, venue: true, city: true, eventDate: true, ticketPrice: true },
          },
        },
      },
      seller: { select: { name: true } },
    },
  })

  // Lazy expiry check
  if (listing.status === ResaleListingStatus.ACTIVE && new Date() > listing.expiresAt) {
    await expireListingIfNeeded(listing.id)
    return { ...listing, status: ResaleListingStatus.EXPIRED }
  }

  // Private listing access control
  if (listing.mode === ResaleMode.PRIVATE) {
    if (userId !== listing.sellerId && userId !== listing.targetBuyerId) {
      throw new Error('FORBIDDEN')
    }
  }

  return listing
}

export async function getDiscoveryListings(filters?: { eventId?: string; city?: string }) {
  const where: any = {
    mode: ResaleMode.PUBLIC,
    status: ResaleListingStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  }

  if (filters?.eventId) {
    where.ticket = { eventId: filters.eventId }
  }
  if (filters?.city) {
    where.ticket = { ...where.ticket, event: { city: filters.city } }
  }

  return prisma.resaleListing.findMany({
    where,
    include: {
      ticket: {
        include: {
          event: {
            select: { id: true, title: true, venue: true, city: true, eventDate: true, ticketPrice: true, imageUrl: true },
          },
        },
      },
      seller: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}
```

- [ ] **Step 6: Verify the full service compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors. Fix any issues.

- [ ] **Step 7: Commit**

```bash
git add src/lib/resaleService.ts
git commit -m "feat(resale): add resale service layer with list, purchase, cancel, discovery"
```

---

### Task 4: Email Templates

**Files:**
- Modify: `src/lib/emailService.ts`

- [ ] **Step 1: Add resale sold notification email**

Append to `src/lib/emailService.ts`:

```typescript
// ─── Resale sold notification (to seller) ────────────────────────────────────

export async function sendResaleSoldNotification({
  to,
  name,
  eventTitle,
  eventDate,
  sellerPayout,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  sellerPayout: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ticket for ${eventTitle} has been sold`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">Ticket sold!</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, your resale listing has been purchased.</p>

        <div style="background: #111118; border: 1px solid #2a2a38; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">${eventTitle}</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.8;">
            📅 ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            💰 Payout: <strong style="color: #2ecc71;">₹${sellerPayout.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style="background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; color: #2ecc71; font-size: 0.875rem;">
          ✓ Your payout will be processed shortly.
        </div>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Add resale purchase confirmation email (to buyer)**

Append to `src/lib/emailService.ts`:

```typescript
// ─── Resale purchase confirmation (to buyer) ─────────────────────────────────

export async function sendResalePurchaseConfirmation({
  to,
  name,
  eventTitle,
  eventDate,
  eventVenue,
  totalPaid,
}: {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  totalPaid: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You've got a ticket for ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">Ticket secured!</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, your resale purchase is confirmed.</p>

        <div style="background: #111118; border: 1px solid #2a2a38; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">${eventTitle}</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.8;">
            📍 ${eventVenue}<br/>
            📅 ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            💰 ₹${totalPaid.toLocaleString('en-IN')} paid
          </div>
        </div>

        <div style="background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; color: #2ecc71; font-size: 0.875rem;">
          ✓ Your QR code is ready. Show it at the venue entrance along with your physical ID.
        </div>

        <a href="${process.env.NEXTAUTH_URL}/tickets" style="display: block; background: #e8ff47; color: #0a0a0f; text-align: center; padding: 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 24px;">
          View QR code →
        </a>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}
```

- [ ] **Step 3: Add private listing notification email (to target buyer)**

Append to `src/lib/emailService.ts`:

```typescript
// ─── Private resale listing notification (to target buyer) ───────────────────

export async function sendPrivateListingNotification({
  to,
  name,
  sellerName,
  eventTitle,
  eventDate,
  eventVenue,
  faceValue,
  convenienceFee,
  listingId,
  expiresAt,
}: {
  to: string
  name: string
  sellerName: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  faceValue: number
  convenienceFee: number
  listingId: string
  expiresAt: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${sellerName} listed a ticket for you — ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8; padding: 40px 32px; border-radius: 12px;">
        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 24px;">
          fair<span style="color: #e8ff47;">pass</span>
        </div>

        <h1 style="font-size: 1.4rem; margin-bottom: 8px;">A ticket is waiting for you!</h1>
        <p style="color: #7a7a96; margin-bottom: 32px;">Hi ${name}, ${sellerName} has listed a ticket for you.</p>

        <div style="background: #111118; border: 1px solid #2a2a38; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px;">${eventTitle}</div>
          <div style="color: #7a7a96; font-size: 0.875rem; line-height: 1.8;">
            📍 ${eventVenue}<br/>
            📅 ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            💰 ₹${faceValue.toLocaleString('en-IN')} + ₹${convenienceFee.toLocaleString('en-IN')} fee
          </div>
        </div>

        <div style="background: rgba(255,159,67,0.1); border: 1px solid rgba(255,159,67,0.3); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="color: #ff9f43; font-weight: 700; margin-bottom: 8px;">⏱ Claim within 2 hours</div>
          <div style="color: #7a7a96; font-size: 0.875rem;">
            This listing expires at <strong style="color: #f0f0f8;">${new Date(expiresAt).toLocaleString('en-IN')}</strong>.
          </div>
        </div>

        <a href="${process.env.NEXTAUTH_URL}/resale/claim/${listingId}" style="display: block; background: #e8ff47; color: #0a0a0f; text-align: center; padding: 14px; border-radius: 8px; font-weight: 700; text-decoration: none; margin-bottom: 24px;">
          Claim this ticket →
        </a>

        <p style="color: #7a7a96; font-size: 0.8rem; text-align: center;">
          FairPass — Tickets belong to people, not resellers.
        </p>
      </div>
    `,
  })
}
```

- [ ] **Step 4: Verify emailService compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep emailService`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/emailService.ts
git commit -m "feat(resale): add resale email templates for sold, purchase, and private listing notifications"
```

---

### Task 5: API Route — Create Listing

**Files:**
- Create: `src/app/api/resale/list/route.ts`

- [ ] **Step 1: Create the listing endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { createResaleListing } from '@/lib/resaleService'
import { sendPrivateListingNotification } from '@/lib/emailService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ListSchema = z.object({
  ticketId: z.string().min(1),
  mode: z.enum(['PRIVATE', 'PUBLIC']),
  targetBuyerEmail: z.string().email().optional(),
}).refine(
  (data) => data.mode !== 'PRIVATE' || !!data.targetBuyerEmail,
  { message: 'targetBuyerEmail is required for private listings', path: ['targetBuyerEmail'] }
)

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = ListSchema.parse(body)

    const { listing, targetBuyerId } = await createResaleListing({
      ticketId: data.ticketId,
      sellerId: session.userId,
      mode: data.mode,
      targetBuyerEmail: data.targetBuyerEmail,
    })

    // Send notification for private listings
    if (data.mode === 'PRIVATE' && targetBuyerId) {
      const [targetUser, seller, ticket] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: targetBuyerId } }),
        prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
        prisma.ticket.findUniqueOrThrow({
          where: { id: data.ticketId },
          include: { event: true },
        }),
      ])

      sendPrivateListingNotification({
        to: targetUser.email,
        name: targetUser.name,
        sellerName: seller.name,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.eventDate.toISOString(),
        eventVenue: `${ticket.event.venue}, ${ticket.event.city}`,
        faceValue: listing.faceValue,
        convenienceFee: listing.convenienceFee,
        listingId: listing.id,
        expiresAt: listing.expiresAt.toISOString(),
      }).catch((err) => console.error('[ResaleListEmail]', err))
    }

    return NextResponse.json({ listing })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      FORBIDDEN: ['Not your ticket', 403],
      TICKET_NOT_BOUND: ['Ticket must be ID-bound before listing for resale', 400],
      MAX_TRANSFERS_REACHED: ['This ticket has reached the maximum number of transfers', 400],
      ALREADY_LISTED: ['This ticket is already listed for resale', 409],
      TOO_CLOSE_TO_EVENT: ['Cannot list for resale within 24 hours of the event', 400],
      TARGET_EMAIL_REQUIRED: ['Recipient email is required for private listings', 400],
      TARGET_USER_NOT_FOUND: ['No registered user found with that email', 404],
      CANNOT_TARGET_SELF: ['You cannot list a ticket for yourself', 400],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResaleList]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/resale/list/route.ts
git commit -m "feat(resale): add POST /api/resale/list endpoint"
```

---

### Task 6: API Route — Discovery

**Files:**
- Create: `src/app/api/resale/discovery/route.ts`

- [ ] **Step 1: Create the discovery endpoint**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/resale/discovery/route.ts
git commit -m "feat(resale): add GET /api/resale/discovery endpoint"
```

---

### Task 7: API Route — Single Listing Detail

**Files:**
- Create: `src/app/api/resale/listing/[id]/route.ts`

- [ ] **Step 1: Create the listing detail endpoint**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/resale/listing/[id]/route.ts
git commit -m "feat(resale): add GET /api/resale/listing/[id] endpoint"
```

---

### Task 8: API Route — Purchase

**Files:**
- Create: `src/app/api/resale/purchase/route.ts`

- [ ] **Step 1: Create the purchase endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth'
import { purchaseResaleListing } from '@/lib/resaleService'
import { sendResaleSoldNotification, sendResalePurchaseConfirmation } from '@/lib/emailService'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PurchaseSchema = z.object({
  listingId: z.string().min(1),
  attendeeName: z.string().min(2),
  idType: z.enum(['AADHAAR', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID']),
  idNumber: z.string().min(4),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()
    const data = PurchaseSchema.parse(body)

    const result = await purchaseResaleListing({
      listingId: data.listingId,
      buyerId: session.userId,
      attendeeName: data.attendeeName,
      idType: data.idType,
      idNumber: data.idNumber,
    })

    // Send emails (fire and forget)
    const listing = await prisma.resaleListing.findUniqueOrThrow({
      where: { id: data.listingId },
      include: {
        seller: { select: { email: true, name: true } },
        ticket: { include: { event: true } },
      },
    })

    sendResaleSoldNotification({
      to: listing.seller.email,
      name: listing.seller.name,
      eventTitle: result.eventTitle,
      eventDate: listing.ticket.event.eventDate.toISOString(),
      sellerPayout: result.sellerPayout,
    }).catch((err) => console.error('[ResaleSoldEmail]', err))

    sendResalePurchaseConfirmation({
      to: session.email,
      name: session.name,
      eventTitle: result.eventTitle,
      eventDate: listing.ticket.event.eventDate.toISOString(),
      eventVenue: `${listing.ticket.event.venue}, ${listing.ticket.event.city}`,
      totalPaid: result.faceValue + result.convenienceFee,
    }).catch((err) => console.error('[ResalePurchaseEmail]', err))

    return NextResponse.json(result)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    const errorMap: Record<string, [string, number]> = {
      UNAUTHORIZED: ['Please log in', 401],
      LISTING_NOT_ACTIVE: ['This listing is no longer available', 410],
      LISTING_EXPIRED: ['This listing has expired', 410],
      CANNOT_BUY_OWN_LISTING: ['You cannot purchase your own listing', 400],
      NOT_TARGET_BUYER: ['This listing is reserved for a specific buyer', 403],
      MAX_TRANSFERS_REACHED: ['This ticket cannot be transferred anymore', 400],
      ID_ALREADY_USED_FOR_EVENT: ['This ID has already been used for this event', 409],
    }
    const [message, status] = errorMap[err.message] || ['Internal server error', 500]
    if (status === 500) console.error('[ResalePurchase]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/resale/purchase/route.ts
git commit -m "feat(resale): add POST /api/resale/purchase endpoint"
```

---

### Task 9: API Route — Cancel Listing

**Files:**
- Create: `src/app/api/resale/cancel/route.ts`

- [ ] **Step 1: Create the cancel endpoint**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/resale/cancel/route.ts
git commit -m "feat(resale): add POST /api/resale/cancel endpoint"
```

---

### Task 10: Remove Old Transfer System

**Files:**
- Delete: `src/app/api/tickets/[id]/transfer/route.ts`
- Delete: `src/app/api/transfer/redeem/route.ts`
- Delete: `src/app/api/transfer/page.tsx`
- Modify: `src/lib/ticketService.ts`

- [ ] **Step 1: Delete old transfer API routes and page**

```bash
rm src/app/api/tickets/[id]/transfer/route.ts
rm src/app/api/transfer/redeem/route.ts
rm src/app/api/transfer/page.tsx
```

After deleting the files, also remove the now-empty directories:

```bash
rmdir src/app/api/tickets/[id]/transfer
rmdir src/app/api/transfer
```

- [ ] **Step 2: Remove transfer functions from ticketService.ts**

Remove the `generateTransferCode` function (lines 190-215) and the `redeemTransferCode` function (lines 219-295) from `src/lib/ticketService.ts`. Also remove the unused `import { createQRToken, hashIDForEvent } from './auth'` if `bindIDToTicket` is the only remaining consumer — check first. `bindIDToTicket` uses both `createQRToken` and `hashIDForEvent`, so the import stays.

The remaining functions in `ticketService.ts` should be: `purchaseTickets`, `bindIDToTicket`, `applyGracePeriodPenalty`, `getUserTickets`.

- [ ] **Step 3: Verify nothing else imports the deleted functions**

Run: `grep -r "generateTransferCode\|redeemTransferCode\|transfer/redeem" src/ --include="*.ts" --include="*.tsx"`

Expected: No matches. If there are matches, update those files to remove the references.

- [ ] **Step 4: Verify the project compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`

Expected: No errors related to removed transfer code.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old transfer code system (replaced by resale marketplace)"
```

---

### Task 11: Frontend — Ticket Wallet Resale UI

**Files:**
- Modify: `src/app/tickets/page.tsx`

- [ ] **Step 1: Replace transfer state and handler with resale state and handlers**

In `src/app/tickets/page.tsx`, replace the transfer-related state variables:

Remove:
```typescript
const [transferLoading, setTransferLoading] = useState<string | null>(null)
const [transferModal, setTransferModal] = useState<{ code: string; expiresAt: string } | null>(null)
```

Add:
```typescript
const [resaleModal, setResaleModal] = useState<string | null>(null) // ticketId being listed
const [resaleMode, setResaleMode] = useState<'PRIVATE' | 'PUBLIC'>('PUBLIC')
const [resaleEmail, setResaleEmail] = useState('')
const [resaleLoading, setResaleLoading] = useState(false)
const [resaleError, setResaleError] = useState('')
const [resaleSuccess, setResaleSuccess] = useState<{ mode: string; faceValue: number; platformFee: number; sellerPayout: number } | null>(null)
const [cancelListingLoading, setCancelListingLoading] = useState<string | null>(null)
```

- [ ] **Step 2: Replace the `handleTransfer` function with resale handlers**

Remove the `handleTransfer` function. Add these two functions:

```typescript
async function handleResaleList(ticketId: string) {
  setResaleLoading(true)
  setResaleError('')
  const res = await fetch('/api/resale/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId,
      mode: resaleMode,
      targetBuyerEmail: resaleMode === 'PRIVATE' ? resaleEmail : undefined,
    }),
  })
  const data = await res.json()
  setResaleLoading(false)
  if (!res.ok) {
    setResaleError(data.error)
    return
  }
  setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'LISTED' } : t))
  setResaleSuccess({
    mode: resaleMode,
    faceValue: data.listing.faceValue,
    platformFee: data.listing.platformFee,
    sellerPayout: data.listing.sellerPayout,
  })
}

async function handleCancelListing(ticketId: string) {
  setCancelListingLoading(ticketId)
  // Find the active listing for this ticket
  const res = await fetch(`/api/tickets`)
  const tData = await res.json()
  // We need the listing ID — fetch it from discovery or a dedicated endpoint
  // For now, we'll call cancel with the ticket's listing
  const listingRes = await fetch('/api/resale/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId: ticketId }),
  })
  setCancelListingLoading(null)
  if (listingRes.ok) {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'BOUND' } : t))
  }
}
```

**Note:** The `handleCancelListing` function needs a `listingId`, not a `ticketId`. We need to update the Ticket type and the `getUserTickets` query to include the active resale listing ID. Update the Ticket type at the top of the file:

```typescript
type Ticket = {
  id: string
  status: string
  attendeeName: string | null
  idType: string | null
  idBoundAt: string | null
  qrToken: string | null
  transferCount: number
  maxTransfers: number
  event: { title: string; venue: string; city: string; eventDate: string; ticketPrice: number; penaltyPercent: number }
  purchase: { idDeadline: string; paymentRef: string }
  resaleListings: { id: string; mode: string; status: string; faceValue: number; sellerPayout: number; expiresAt: string }[]
}
```

Then update `handleCancelListing`:

```typescript
async function handleCancelListing(listingId: string) {
  setCancelListingLoading(listingId)
  const res = await fetch('/api/resale/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  })
  setCancelListingLoading(null)
  if (res.ok) {
    setTickets(prev => prev.map(t => {
      const hasListing = t.resaleListings.some(l => l.id === listingId)
      return hasListing ? { ...t, status: 'BOUND', resaleListings: [] } : t
    }))
  }
}
```

- [ ] **Step 3: Update `getUserTickets` in ticketService.ts to include resale listings**

In `src/lib/ticketService.ts`, update the `getUserTickets` function to include active resale listings:

```typescript
export async function getUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    include: {
      event: { select: { title: true, venue: true, city: true, eventDate: true, ticketPrice: true, penaltyPercent: true } },
      purchase: { select: { idDeadline: true, paymentRef: true } },
      resaleListings: {
        where: { status: 'ACTIVE' },
        select: { id: true, mode: true, status: true, faceValue: true, sellerPayout: true, expiresAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
```

- [ ] **Step 4: Update the filter chips to include LISTED status**

In the filter chips array in the JSX, add the LISTED filter:

```typescript
{[
  { key: 'all', label: 'All' },
  { key: 'PENDING_ID', label: 'Needs ID' },
  { key: 'BOUND', label: 'Ready' },
  { key: 'LISTED', label: 'Listed' },
  { key: 'INVALID', label: 'Expired' },
  { key: 'REFUNDED', label: 'Refunded' },
  { key: 'USED', label: 'Used' },
].map(({ key, label }) => {
```

Also update `activeCount` to include LISTED:

```typescript
const activeCount = tickets.filter(ticket => ['PENDING_ID', 'BOUND', 'LISTED'].includes(getEffectiveStatus(ticket))).length
```

- [ ] **Step 5: Update the TicketCard BOUND section — replace Transfer button with Resell**

In the `TicketCard` component, replace the BOUND section's Transfer button. Change this block:

```tsx
{effectiveStatus === 'BOUND' && (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
    <div className="card-soft" style={{ padding: 14, flex: 1 }}>
      <span className="muted">Bound to </span>
      <strong>{ticket.attendeeName}</strong>
      <span className="muted"> | {ticket.idType}</span>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button onClick={onShowQR} disabled={qrLoading} className="button button-secondary">{qrLoading ? 'Loading QR...' : 'View QR'}</button>
      <button onClick={onTransfer} disabled={transferLoading} className="button button-secondary">{transferLoading ? 'Generating...' : 'Transfer'}</button>
    </div>
  </div>
)}
```

Replace with:

```tsx
{effectiveStatus === 'BOUND' && (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
    <div className="card-soft" style={{ padding: 14, flex: 1 }}>
      <span className="muted">Bound to </span>
      <strong>{ticket.attendeeName}</strong>
      <span className="muted"> | {ticket.idType}</span>
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button onClick={onShowQR} disabled={qrLoading} className="button button-secondary">{qrLoading ? 'Loading QR...' : 'View QR'}</button>
      {ticket.transferCount < ticket.maxTransfers && (
        <button onClick={onResell} className="button button-secondary">Resell</button>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 6: Add LISTED status rendering to TicketCard**

Add a new block after the BOUND block in TicketCard for LISTED tickets:

```tsx
{effectiveStatus === 'LISTED' && (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
    <div className="card-soft" style={{ padding: 14, flex: 1 }}>
      <span className="badge badge-cyan" style={{ marginRight: 10 }}>Listed for resale</span>
      <span className="muted">
        {ticket.resaleListings[0]?.mode === 'PRIVATE' ? 'Private listing' : 'Public listing'}
        {' · '}Payout: ₹{ticket.resaleListings[0]?.sellerPayout.toLocaleString('en-IN')}
      </span>
    </div>
    <button
      onClick={() => onCancelListing(ticket.resaleListings[0]?.id)}
      disabled={cancelListingLoading}
      className="button button-danger"
    >
      {cancelListingLoading ? 'Cancelling...' : 'Cancel listing'}
    </button>
  </div>
)}
```

- [ ] **Step 7: Update TicketCard props**

Update the TicketCard component's props and the call site. Replace the old transfer props:

Remove from the TicketCard call:
```typescript
onTransfer={() => handleTransfer(ticket.id)}
transferLoading={transferLoading === ticket.id}
```

Add to the TicketCard call:
```typescript
onResell={() => { setResaleModal(ticket.id); setResaleError(''); setResaleMode('PUBLIC'); setResaleEmail('') }}
onCancelListing={(listingId: string) => handleCancelListing(listingId)}
cancelListingLoading={cancelListingLoading === ticket.resaleListings[0]?.id}
```

Update the TicketCard function signature to accept the new props (it uses `any` so no interface change needed, but the props are now `onResell`, `onCancelListing`, `cancelListingLoading` instead of `onTransfer`, `transferLoading`).

- [ ] **Step 8: Add statusClass for LISTED and update badge styles**

In the `statusClass` map inside TicketCard, add:

```typescript
LISTED: 'badge-cyan',
```

- [ ] **Step 9: Replace the transfer modal with the resale listing modal**

Remove the entire `transferModal` modal JSX block. Replace it with:

```tsx
{resaleModal && !resaleSuccess && (
  <div className="dialog-backdrop" onClick={() => setResaleModal(null)}>
    <div className="dialog" onClick={e => e.stopPropagation()}>
      <div className="badge badge-cyan" style={{ marginBottom: 14 }}>List for resale</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Resell this ticket</h3>
      <p className="muted" style={{ marginBottom: 18 }}>
        Your ticket will be listed at face value. Choose who can buy it.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button
          onClick={() => setResaleMode('PUBLIC')}
          className={`button ${resaleMode === 'PUBLIC' ? 'button-primary' : 'button-secondary'}`}
          style={{ flex: 1 }}
        >
          Public
        </button>
        <button
          onClick={() => setResaleMode('PRIVATE')}
          className={`button ${resaleMode === 'PRIVATE' ? 'button-primary' : 'button-secondary'}`}
          style={{ flex: 1 }}
        >
          Private
        </button>
      </div>

      {resaleMode === 'PRIVATE' && (
        <div style={{ marginBottom: 18 }}>
          <label className="label">Recipient's email</label>
          <input
            value={resaleEmail}
            onChange={e => setResaleEmail(e.target.value)}
            placeholder="friend@example.com"
            className="input"
            type="email"
          />
        </div>
      )}

      {(() => {
        const ticket = tickets.find(t => t.id === resaleModal)
        if (!ticket) return null
        const faceValue = ticket.event.ticketPrice
        const platformFee = faceValue * 0.05
        const sellerPayout = faceValue - platformFee
        return (
          <div className="card-soft" style={{ padding: 16, marginBottom: 18 }}>
            <Row label="Face value" value={`₹${faceValue.toLocaleString('en-IN')}`} />
            <Row label="Platform fee (5%)" value={`-₹${platformFee.toLocaleString('en-IN')}`} />
            <div className="divider" style={{ margin: '12px 0' }} />
            <Row label="Your payout" value={`₹${sellerPayout.toLocaleString('en-IN')}`} />
          </div>
        )
      })()}

      <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 18 }}>
        {resaleMode === 'PUBLIC'
          ? 'Your ticket will appear on the public resale page until someone buys it or the event is within 24 hours.'
          : 'The recipient will have 2 hours to claim this ticket.'}
      </p>

      {resaleError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{resaleError}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => handleResaleList(resaleModal)}
          disabled={resaleLoading || (resaleMode === 'PRIVATE' && !resaleEmail)}
          className="button button-primary"
          style={{ flex: 1 }}
        >
          {resaleLoading ? 'Listing...' : 'Confirm listing'}
        </button>
        <button onClick={() => setResaleModal(null)} className="button button-secondary" style={{ flex: 1 }}>Cancel</button>
      </div>
    </div>
  </div>
)}

{resaleSuccess && (
  <div className="dialog-backdrop" onClick={() => { setResaleSuccess(null); setResaleModal(null) }}>
    <div className="dialog" onClick={e => e.stopPropagation()}>
      <div className="badge badge-success" style={{ marginBottom: 14 }}>Listed!</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ticket listed for resale</h3>
      <p className="muted" style={{ marginBottom: 20 }}>
        {resaleSuccess.mode === 'PUBLIC'
          ? 'Your ticket is now visible on the resale marketplace.'
          : 'The recipient has been notified and has 2 hours to claim it.'}
        {' '}Your payout when sold: ₹{resaleSuccess.sellerPayout.toLocaleString('en-IN')}
      </p>
      <button onClick={() => { setResaleSuccess(null); setResaleModal(null) }} className="button button-primary button-full">Done</button>
    </div>
  </div>
)}
```

- [ ] **Step 10: Verify the tickets page compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "tickets/page"`

Expected: No errors.

- [ ] **Step 11: Commit**

```bash
git add src/app/tickets/page.tsx src/lib/ticketService.ts
git commit -m "feat(resale): replace transfer UI with resale listing in ticket wallet"
```

---

### Task 12: Frontend — Resale Discovery Page

**Files:**
- Create: `src/app/resale/page.tsx`

- [ ] **Step 1: Create the discovery page**

```tsx
'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ResaleListing = {
  id: string
  faceValue: number
  convenienceFee: number
  expiresAt: string
  seller: { name: string }
  ticket: {
    event: {
      id: string
      title: string
      venue: string
      city: string
      eventDate: string
      ticketPrice: number
      imageUrl: string | null
    }
  }
}

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

export default function ResaleDiscoveryPage() {
  const router = useRouter()
  const [listings, setListings] = useState<ResaleListing[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [purchaseModal, setPurchaseModal] = useState<ResaleListing | null>(null)
  const [purchaseForm, setPurchaseForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ eventTitle: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/resale/discovery').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([rData, meData]) => {
      setListings(rData.listings || [])
      setUser(meData.user || null)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/me', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  const cities = useMemo(() => Array.from(new Set(listings.map(l => l.ticket.event.city))).sort(), [listings])

  const filtered = useMemo(() => {
    let result = [...listings]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        [l.ticket.event.title, l.ticket.event.venue, l.ticket.event.city].some(v => v.toLowerCase().includes(q))
      )
    }
    if (cityFilter) {
      result = result.filter(l => l.ticket.event.city === cityFilter)
    }
    return result
  }, [listings, search, cityFilter])

  async function handlePurchase() {
    if (!purchaseModal) return
    setPurchaseLoading(true)
    setPurchaseError('')
    const res = await fetch('/api/resale/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: purchaseModal.id,
        ...purchaseForm,
      }),
    })
    const data = await res.json()
    setPurchaseLoading(false)
    if (!res.ok) {
      setPurchaseError(data.error)
      return
    }
    setPurchaseSuccess({ eventTitle: data.eventTitle })
    setListings(prev => prev.filter(l => l.id !== purchaseModal.id))
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link href="/" className="brand">fair<span className="brand-accent">pass</span></Link>
        <div className="nav-actions">
          <Link href="/events" className="button button-secondary">Events</Link>
          {user ? (
            <>
              <Link href="/tickets" className="button button-secondary">My tickets</Link>
              <span className="muted">{user.name}</span>
              <button onClick={logout} className="button button-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="button button-secondary">Log in</Link>
              <Link href="/register" className="button button-primary">Create account</Link>
            </>
          )}
        </div>
      </nav>

      <main className="page-container page-section">
        <div style={{ marginBottom: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span>Resale marketplace</span>
          </div>
          <h1 className="section-heading" style={{ marginBottom: 8 }}>Face-value resale tickets</h1>
          <p className="section-copy">Tickets listed by other fans at the original price. Every ticket is ID-verified.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
          <div className="card-soft" style={{ padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 280px', minWidth: 200 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search events, venues, or cities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, flex: 1 }}
            />
          </div>
          {cities.length > 1 && (
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="select"
              style={{ flex: '0 0 auto', minWidth: 140 }}
            >
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <div className="badge badge-neutral">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => <div key={i} className="card" style={{ minHeight: 200, opacity: 0.4 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No resale tickets available</h3>
            <p className="muted" style={{ marginBottom: 18 }}>Check back later or browse primary event listings.</p>
            <Link href="/events" className="button button-secondary">Browse events</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))', gap: 20 }}>
            {filtered.map(listing => (
              <div key={listing.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 160, background: 'var(--surface-3)', flexShrink: 0 }}>
                  {listing.ticket.event.imageUrl ? (
                    <img src={listing.ticket.event.imageUrl} alt={listing.ticket.event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontFamily: 'Sora' }}>FairPass Live</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,17,27,0.08), rgba(7,17,27,0.78))' }} />
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="badge badge-accent">Resale</span>
                  </div>
                  <div style={{ position: 'absolute', left: 14, bottom: 14 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{listing.ticket.event.title}</h3>
                    <p className="muted" style={{ fontSize: '0.85rem', color: 'rgba(238,244,251,0.78)' }}>{listing.ticket.event.venue}, {listing.ticket.event.city}</p>
                  </div>
                </div>
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div className="muted" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                      {new Date(listing.ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <div>
                        <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</div>
                        <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.3rem' }}>₹{listing.faceValue.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="muted" style={{ fontSize: '0.82rem' }}>+₹{listing.convenienceFee.toLocaleString('en-IN')} fee</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) { router.push('/login'); return }
                      setPurchaseModal(listing)
                      setPurchaseForm({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
                      setPurchaseError('')
                    }}
                    className="button button-primary"
                    style={{ width: '100%' }}
                  >
                    Buy ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {purchaseModal && !purchaseSuccess && (
        <div className="dialog-backdrop" onClick={() => setPurchaseModal(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <div className="badge badge-accent" style={{ marginBottom: 14 }}>Purchase resale ticket</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{purchaseModal.ticket.event.title}</h3>
            <p className="muted" style={{ marginBottom: 18 }}>
              Bind your government ID to complete the purchase.
            </p>

            <div className="card-soft" style={{ padding: 16, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Face value</span>
                <strong>₹{purchaseModal.faceValue.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Convenience fee (5%)</span>
                <strong>₹{purchaseModal.convenienceFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="divider" style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span className="muted">Total</span>
                <strong style={{ color: 'var(--accent)' }}>₹{(purchaseModal.faceValue + purchaseModal.convenienceFee).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Full name (as on ID)</label>
                  <input value={purchaseForm.attendeeName} onChange={e => setPurchaseForm({ ...purchaseForm, attendeeName: e.target.value })} placeholder="Full name on ID" className="input" />
                </div>
                <div>
                  <label className="label">ID type</label>
                  <select value={purchaseForm.idType} onChange={e => setPurchaseForm({ ...purchaseForm, idType: e.target.value })} className="select">
                    {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">ID number</label>
                <input value={purchaseForm.idNumber} onChange={e => setPurchaseForm({ ...purchaseForm, idNumber: e.target.value })} placeholder="Enter your ID number" className="input" />
              </div>
            </div>

            {purchaseError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{purchaseError}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handlePurchase}
                disabled={purchaseLoading || !purchaseForm.attendeeName || !purchaseForm.idNumber}
                className="button button-primary"
                style={{ flex: 1 }}
              >
                {purchaseLoading ? 'Processing...' : `Pay ₹${(purchaseModal.faceValue + purchaseModal.convenienceFee).toLocaleString('en-IN')}`}
              </button>
              <button onClick={() => setPurchaseModal(null)} className="button button-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {purchaseSuccess && (
        <div className="dialog-backdrop" onClick={() => { setPurchaseSuccess(null); setPurchaseModal(null) }}>
          <div className="dialog" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ marginBottom: 14 }}>Ticket secured!</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8 }}>You're going to {purchaseSuccess.eventTitle}!</h3>
            <p className="muted" style={{ marginBottom: 20 }}>Your ticket has been bound to your ID and a QR code is ready.</p>
            <Link href="/tickets">
              <button className="button button-primary button-full">View my tickets</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify page compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "resale/page"`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/resale/page.tsx
git commit -m "feat(resale): add public resale discovery page"
```

---

### Task 13: Frontend — Private Claim Page

**Files:**
- Create: `src/app/resale/claim/[id]/page.tsx`

- [ ] **Step 1: Create the private claim page**

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'VOTER_ID', label: 'Voter ID' },
]

type Listing = {
  id: string
  mode: string
  status: string
  faceValue: number
  convenienceFee: number
  expiresAt: string
  seller: { name: string }
  ticket: {
    event: {
      title: string
      venue: string
      city: string
      eventDate: string
      ticketPrice: number
    }
  }
}

export default function ClaimPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ attendeeName: '', idType: 'AADHAAR', idNumber: '' })
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/resale/listing/${listingId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setListing(data.listing)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load listing')
        setLoading(false)
      })
  }, [listingId])

  async function handleClaim() {
    setPurchaseLoading(true)
    setPurchaseError('')
    const res = await fetch('/api/resale/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, ...form }),
    })
    const data = await res.json()
    setPurchaseLoading(false)
    if (!res.ok) {
      setPurchaseError(data.error)
      return
    }
    setSuccess(true)
  }

  const expired = listing ? new Date() > new Date(listing.expiresAt) : false
  const unavailable = listing && (listing.status !== 'ACTIVE' || expired)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="muted">Loading...</span>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Sora', fontSize: '1.4rem', marginBottom: 8 }}>Listing not available</h2>
          <p className="muted" style={{ marginBottom: 20 }}>{error || 'This listing may have expired or been cancelled.'}</p>
          <Link href="/resale"><button className="button button-primary">Browse resale tickets</button></Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 460, textAlign: 'center' }}>
          <div className="badge badge-success" style={{ marginBottom: 14 }}>Ticket claimed!</div>
          <h2 style={{ fontFamily: 'Sora', fontSize: '1.4rem', marginBottom: 8 }}>You're going to {listing.ticket.event.title}!</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Your ticket is bound to your ID and your QR code is ready.</p>
          <Link href="/tickets"><button className="button button-primary" style={{ width: '100%' }}>View my tickets</button></Link>
        </div>
      </div>
    )
  }

  const timeLeft = new Date(listing.expiresAt).getTime() - Date.now()
  const minsLeft = Math.max(0, Math.floor(timeLeft / 60000))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 500 }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&larr; Back to home</Link>

        <div style={{ marginTop: 24 }}>
          <div className="badge badge-cyan" style={{ marginBottom: 14 }}>Private listing from {listing.seller.name}</div>
          <h1 style={{ fontFamily: 'Sora', fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>{listing.ticket.event.title}</h1>
          <p className="muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
            {listing.ticket.event.venue}, {listing.ticket.event.city} · {new Date(listing.ticket.event.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

          {unavailable ? (
            <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '16px 14px', marginBottom: 18 }}>
              This listing has {expired ? 'expired' : 'been ' + listing.status.toLowerCase()}.
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(255,159,67,0.1)', border: '1px solid rgba(255,159,67,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: '0.875rem', color: '#ff9f43' }}>
                ⏱ {minsLeft} minutes remaining to claim
              </div>

              <div className="card-soft" style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Face value</span>
                  <strong>₹{listing.faceValue.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Convenience fee (5%)</span>
                  <strong>₹{listing.convenienceFee.toLocaleString('en-IN')}</strong>
                </div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="muted">Total</span>
                  <strong style={{ color: 'var(--accent)' }}>₹{(listing.faceValue + listing.convenienceFee).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Your ID details</h3>
              <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full name (as on ID)</label>
                  <input value={form.attendeeName} onChange={e => setForm({ ...form, attendeeName: e.target.value })} placeholder="Full name on ID" className="input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ID type</label>
                    <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} className="select">
                      {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ID number</label>
                    <input value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="Enter ID number" className="input" />
                  </div>
                </div>
              </div>

              {purchaseError && <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', marginBottom: 14 }}>{purchaseError}</div>}

              <button
                onClick={handleClaim}
                disabled={purchaseLoading || !form.attendeeName || !form.idNumber}
                className="button button-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {purchaseLoading ? 'Processing...' : `Claim for ₹${(listing.faceValue + listing.convenienceFee).toLocaleString('en-IN')}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify page compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | grep "claim"`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/resale/claim/[id]/page.tsx
git commit -m "feat(resale): add private claim page"
```

---

### Task 14: Navigation Updates

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/events/page.tsx`
- Modify: `src/app/tickets/page.tsx`

- [ ] **Step 1: Add Resale link to the home page nav**

In `src/app/page.tsx`, find the nav section. The nav has links like "Browse events" and "My tickets". Add a "Resale" link next to "Browse events". Look for the `nav-actions` div and add:

```tsx
<Link href="/resale" className="button button-secondary">Resale</Link>
```

Place it after the "Browse events" link in the authenticated nav and in the unauthenticated nav.

- [ ] **Step 2: Add Resale link to the events page nav**

In `src/app/events/page.tsx`, find the nav section. Add a "Resale" link. In the authenticated block, add before the dashboard/tickets link:

```tsx
<Link href="/resale" className="button button-secondary">Resale</Link>
```

Also add it in the unauthenticated block.

- [ ] **Step 3: Add Resale link to the tickets page nav**

In `src/app/tickets/page.tsx`, find the topbar nav. Add:

```tsx
<Link href="/resale" className="button button-secondary">Resale</Link>
```

Place it next to the existing "Browse events" link.

- [ ] **Step 4: Verify all pages compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/events/page.tsx src/app/tickets/page.tsx
git commit -m "feat(resale): add Resale link to navigation across all pages"
```

---

### Task 15: Manual Verification

- [ ] **Step 1: Start the dev server and database**

Run: `docker-compose up -d` (if not already running)
Run: `npm run dev`

- [ ] **Step 2: Test the listing flow**

1. Log in as `fan@demo.com` / `password123`
2. If you have a BOUND ticket, click "Resell"
3. Select Public mode, confirm the listing
4. Verify the ticket status changes to "Listed"

- [ ] **Step 3: Test the discovery page**

1. Navigate to `/resale`
2. Verify the public listing appears
3. Check filters work (search, city)

- [ ] **Step 4: Test the purchase flow**

1. Log in as a different user (or register a new account)
2. Navigate to `/resale`
3. Click "Buy ticket" on the listing
4. Fill in ID details, confirm purchase
5. Verify success modal appears
6. Check the ticket appears in the buyer's wallet

- [ ] **Step 5: Test private listing flow**

1. Log in as the ticket owner
2. Create a private listing targeting another user's email
3. Check the listing detail page at `/resale/claim/[id]`
4. Log in as the target user, navigate to the claim URL
5. Complete the purchase

- [ ] **Step 6: Test cancel listing**

1. List a ticket for resale
2. Click "Cancel listing" on the listed ticket
3. Verify the ticket returns to BOUND status

- [ ] **Step 7: Commit any fixes discovered during testing**

```bash
git add -A
git commit -m "fix(resale): address issues found during manual testing"
```
