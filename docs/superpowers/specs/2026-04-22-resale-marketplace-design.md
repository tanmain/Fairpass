# Dual-Mode Resale Marketplace

Allows ticket holders to list their ID-bound tickets for resale on the platform. All resales occur at face value. The system manages rebinding the ticket to the new buyer's verified ID.

This feature replaces the existing transfer code system entirely.

## Decisions

| Decision | Choice |
|---|---|
| Architecture | Separate `ResaleListing` model |
| Old transfer system | Replaced entirely by the marketplace |
| Fees | 5% buyer convenience fee, 5% seller platform fee (hardcoded constants) |
| Payments | Stubbed (generates payment refs, no real payment provider) |
| Fingerprinting | Skipped — ID-binding already prevents shill transactions |
| Resale cutoff | 24 hours before event (hardcoded) |
| Private claim window | 2 hours (hardcoded) |
| Listing expiry | Lazy — checked at read time, filtered in queries |

## Data Model

### New enums

```
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

### New model: ResaleListing

| Field | Type | Notes |
|---|---|---|
| `id` | cuid | PK |
| `ticketId` | FK -> Ticket | The ticket being resold |
| `sellerId` | FK -> User | Current ticket owner |
| `targetBuyerId` | FK -> User (nullable) | Set for PRIVATE listings only |
| `buyerId` | FK -> User (nullable) | Set when purchased |
| `mode` | ResaleMode | PRIVATE or PUBLIC |
| `status` | ResaleListingStatus | ACTIVE -> SOLD / EXPIRED / CANCELLED |
| `faceValue` | Float | Locked at event ticket price |
| `convenienceFee` | Float | Buyer pays this (5% of face value) |
| `platformFee` | Float | Deducted from seller payout (5% of face value) |
| `sellerPayout` | Float | faceValue - platformFee |
| `expiresAt` | DateTime | 2h for private, eventDate - 24h for public |
| `purchasedAt` | DateTime (nullable) | When the sale completed |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

Relations: listing belongs to ticket, seller, targetBuyer (optional), buyer (optional). Ticket has an optional back-reference `resaleListingId`.

### Changes to Ticket model

**Add:**
- `resaleListingId` — nullable FK to `ResaleListing`. Set when actively listed, cleared on sale/expiry/cancel.

**Add to TicketStatus enum:**
- `LISTED` — prevents a listed ticket from being used at entry.

**Remove:**
- `transferCode` — replaced by marketplace
- `transferCodeExpiresAt` — replaced by marketplace
- `transferCodeUsed` — replaced by marketplace

**Keep:**
- `transferCount`, `maxTransfers`, `lastTransferAt` — resale system uses these to enforce transfer limits.

## API Endpoints

### Remove

- `POST /api/tickets/[id]/transfer` — old code generation
- `POST /api/transfer/redeem` — old code redemption

### POST /api/resale/list

Creates a resale listing.

**Request body:**
```json
{
  "ticketId": "string",
  "mode": "PRIVATE | PUBLIC",
  "targetBuyerEmail": "string (required if PRIVATE)"
}
```

**Validations:**
- Caller owns the ticket
- Ticket status is `BOUND`
- `transferCount < maxTransfers`
- Event date is > 24 hours away
- No existing active listing for this ticket
- If PRIVATE: target email resolves to a registered user, and it's not the seller

**On success:**
- Create `ResaleListing` with status `ACTIVE`
- Set ticket status to `LISTED`, set `resaleListingId`
- If PRIVATE: send email to target buyer with claim link

**Response:** The created ResaleListing object.

### GET /api/resale/discovery

Fetches all public active listings. No auth required.

**Query params:**
- `eventId` — optional, filter by event
- `city` — optional, filter by event city

**Behavior:**
- Filters out listings where `expiresAt < now` in the query
- Returns listings with event details (title, date, venue, price)

### GET /api/resale/listing/[id]

Fetch a single listing's details. Used for the private claim link and for viewing before purchase. Auth required — if the listing is PRIVATE, only the target buyer or the seller can view it.

### POST /api/resale/purchase

Executes the resale transaction.

**Request body:**
```json
{
  "listingId": "string",
  "attendeeName": "string",
  "idType": "AADHAAR | PASSPORT | DRIVING_LICENSE | VOTER_ID",
  "idNumber": "string"
}
```

**Validations:**
- Listing is `ACTIVE` and not expired
- Caller is authenticated
- If PRIVATE: caller matches `targetBuyerId`
- Buyer's ID not already used for this event
- Buyer is not the seller

**Atomic transaction:**
1. Void old QR token, remove old EventIDUsage
2. Bind new buyer's ID (hash it), generate new QR token
3. Update ticket: new `userId`, status back to `BOUND`, increment `transferCount`, set `lastTransferAt`, clear `resaleListingId`
4. Update listing: status to `SOLD`, set `buyerId` and `purchasedAt`
5. Generate stubbed payment refs for buyer charge and seller payout

**Side effects (emails):**
- Seller: "Your ticket for X has been sold. Payout: ₹Y"
- Buyer: "You've purchased a resale ticket for X. Your QR is ready."

### POST /api/resale/cancel

Seller cancels their own listing.

**Request body:**
```json
{
  "listingId": "string"
}
```

**Validations:**
- Caller is the seller
- Listing status is `ACTIVE`

**On success:**
- Listing status -> `CANCELLED`
- Ticket status -> `BOUND`
- Clear `resaleListingId` on ticket

## Listing Expiry

**Private listings:** `expiresAt` = `now + 2 hours`.

**Public listings:** `expiresAt` = `eventDate - 24 hours`.

**Expiry is lazy — no background jobs.** Checked at read time:
- `GET /api/resale/discovery` filters `expiresAt < now` in the query, so expired listings never appear
- `POST /api/resale/purchase` rejects expired listings
- When an expired listing is accessed via `GET /api/resale/listing/[id]`, the API lazily updates: listing status -> `EXPIRED`, ticket status -> `BOUND`

This avoids adding BullMQ jobs for expiry. The consequence of a few minutes' delay in cleanup is minimal.

## Frontend

### Ticket wallet (`/tickets`)

- Replace "Transfer" button with "Resell" button on BOUND tickets
- Resell modal:
  - Mode toggle: Private / Public
  - If Private: email input for target buyer
  - Summary: face value, platform fee, seller payout
  - Confirm button
- Listed tickets show a "Listed" badge and "Cancel Listing" button
- Remove all transfer code UI (generation and redemption)

### New page: `/resale` (Discovery)

- Public browse page showing all active public resale listings
- Filters: event, city
- Each listing card: event title, date, venue, face value + convenience fee
- "Buy" button -> ID submission form (attendee name, ID type, ID number) and purchase confirmation
- Accessible from main navigation

### Private claim flow: `/resale/claim/[listingId]`

- Recipient gets an email with a link to this page
- Shows listing details, who listed it, countdown timer for claim window
- Same ID submission form as discovery purchase

### Navigation

- Add "Resale" link to main nav for the discovery page

## Removed Code

### API routes deleted
- `src/app/api/tickets/[id]/transfer/route.ts`
- `src/app/api/transfer/redeem/route.ts`

### Service functions removed from `ticketService.ts`
- `generateTransferCode()`
- `redeemTransferCode()`

### Frontend
- Transfer code generation UI in ticket wallet
- Transfer code redemption UI

## Email Templates

Three new emails added to `emailService.ts`:

### Resale sold notification (to seller)
- Subject: "Your ticket for {eventTitle} has been sold"
- Body: Confirmation of sale, payout amount (faceValue - platformFee)

### Resale purchase confirmation (to buyer)
- Subject: "You've got a ticket for {eventTitle}"
- Body: Event details, confirmation that QR is ready, link to view ticket

### Private listing notification (to target buyer)
- Subject: "{sellerName} listed a ticket for you — {eventTitle}"
- Body: Event details, face value + convenience fee, claim link, 2-hour expiry warning

## Constants

Hardcoded in a constants file, easy to change later:

```typescript
export const RESALE_CONVENIENCE_FEE_PERCENT = 5
export const RESALE_PLATFORM_FEE_PERCENT = 5
export const RESALE_CUTOFF_HOURS = 24
export const PRIVATE_LISTING_CLAIM_HOURS = 2
```
