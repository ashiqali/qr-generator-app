# QRForge

A full-stack QR code generator SaaS: create static and dynamic QR codes (URL, WiFi, vCard, email,
SMS, phone, app store smart links, PDF), track scans, customize branding, generate in bulk, and
call a REST API — gated by Free / Pro / Business subscription plans billed through Stripe.

## Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL via Prisma (Neon, Supabase, Aiven, RDS, or `docker-compose.yml` locally)
- **Auth**: Auth.js v5 — email/password out of the box, Google OAuth optional
- **Payments**: Stripe Checkout + Customer Portal + webhooks
- **UI**: Tailwind CSS + shadcn/ui (Base UI primitives)
- **QR engine**: `qrcode` (matrix) + a custom SVG renderer (styling/logo/frame) + `sharp` (PNG) +
  `pdf-lib` (PDF) — no native-canvas build step required
- **Testing**: Vitest (unit) + Playwright (e2e, scaffolding provided)

## Getting started

```bash
npm install
cp .env.example .env   # then set DATABASE_URL to your Postgres connection string
npx prisma migrate dev
npm run db:seed        # optional demo data: demo@qrforge.dev / password123
npm run dev
```

Open http://localhost:3000. Email/password sign-up works immediately — no external accounts
beyond Postgres are needed to try the product end to end (QR creation, dynamic redirects, scan
analytics, bulk generation, API keys).

## Environment variables

See `.env.example` for the full list. Nothing is required to run locally beyond `DATABASE_URL`,
`AUTH_SECRET`, and `NEXTAUTH_URL` (already filled in). Everything else degrades gracefully when
unset:

- **Google OAuth** (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) — when unset, the "Continue with
  Google" button is hidden and only email/password auth is offered.
- **Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_BUSINESS`) — when unset, the billing page shows a "not
  configured" banner and upgrade buttons are disabled instead of erroring.

### Setting up Stripe (optional, for real billing)

1. Create a Stripe account and switch to test mode.
2. Create two recurring Products/Prices (Pro, Business) and copy their price IDs into
   `STRIPE_PRICE_ID_PRO` / `STRIPE_PRICE_ID_BUSINESS`.
3. Copy your test **Secret key** into `STRIPE_SECRET_KEY` and **Publishable key** into
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) and copy the
   printed signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Restart the dev server.

### Setting up Google OAuth (optional)

Create an OAuth client in the Google Cloud Console with redirect URI
`http://localhost:3000/api/auth/callback/google`, then set `GOOGLE_CLIENT_ID` /
`GOOGLE_CLIENT_SECRET`.

## Database

`DATABASE_URL` points at any PostgreSQL instance — a managed one (Neon, Supabase, Aiven, RDS) for
either local dev or production, or run the included `docker-compose.yml` (`docker compose up -d`)
for a fully local Postgres. Run `npx prisma migrate dev` after changing it to apply the schema.

## Project structure

```
src/
  app/
    (auth)/            sign-in / sign-up pages + actions
    dashboard/          the authenticated app (QR CRUD, analytics, billing, bulk, API keys, settings)
    r/[shortCode]/       public redirect/landing page for dynamic QR codes (scan tracking lives here)
    api/                 REST endpoints: QR export, preview, bulk zip, Stripe webhook, public v1 API
    pricing/, docs/api/  marketing + API documentation pages
  lib/
    qr/                  the QR engine: matrix generation, SVG styling, encoders, export, analytics
    plans.ts, plan-limits.ts   subscription tier definitions + enforcement
    validations/         zod schemas
prisma/
  schema.prisma          data model
  seed.ts                demo data
```

## Testing

```bash
npm run test        # Vitest unit tests (QR engine, CSV parsing, plan logic)
npm run test:e2e     # Playwright e2e (requires `npm run dev` running separately)
npm run lint
npx tsc --noEmit
```

## Subscription plans

| | Free | Pro | Business |
|---|---|---|---|
| QR codes | 5 | Unlimited | Unlimited |
| Dynamic (trackable) QR codes | 1 | Unlimited | Unlimited |
| Custom branding (colors/logo/frame) | – | ✓ | ✓ |
| Bulk CSV generation | – | ✓ | ✓ |
| REST API access | – | – | ✓ (5 keys) |

Plan limits are defined in [`src/lib/plans.ts`](src/lib/plans.ts) and enforced in
[`src/lib/plan-limits.ts`](src/lib/plan-limits.ts).
