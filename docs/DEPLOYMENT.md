# Deploying FairPass to Railway

## Services

FairPass runs as a single Railway service + managed Postgres:

| Service | Type | Notes |
|---|---|---|
| **fairpass** | Web (Next.js) | Auto-detected from repo |
| **Postgres** | Database | Railway plugin, auto-injects DATABASE_URL |

## Setup

1. Create a new Railway project
2. Add a **PostgreSQL** plugin (this auto-injects `DATABASE_URL`)
3. Connect your GitHub repo — Railway auto-detects Next.js
4. Set environment variables (see `.env.example` for the full list):
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` — your Railway app URL (e.g., `https://fairpass-production.up.railway.app`)
   - `QR_JWT_SECRET` — run `openssl rand -base64 32` to generate
   - `RESEND_API_KEY` — from your Resend dashboard
   - `RESEND_FROM` — verified sender (e.g., `FairPass <hello@fairpass.in>`)
   - `CRON_SECRET` — run `openssl rand -base64 32` to generate
5. Deploy — Railway runs the build and start commands from `railway.toml`

## Database Migrations

Migrations run automatically on each deploy via `npx prisma migrate deploy` in the start command.

To create a new migration locally:
```bash
npx prisma migrate dev --name describe_your_change
```

## Cron Job (Grace Period Processing)

The penalty/reminder system runs via a cron-triggered API route instead of a background worker.

### Setup in Railway:
1. Go to your project settings
2. Add a **Cron Job** service
3. Schedule: `*/5 * * * *` (every 5 minutes)
4. Endpoint: `POST https://your-app.railway.app/api/cron/process-deadlines`
5. Headers: `Authorization: Bearer <your-CRON_SECRET-value>`

This endpoint:
- Applies penalties for purchases past their ID deadline
- Sends reminder emails for deadlines within 1 hour

## Seed Data (Optional)

To seed demo data on first deploy:
```bash
railway run npx prisma db seed
```
