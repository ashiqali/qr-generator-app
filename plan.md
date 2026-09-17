# QR SaaS — Full-Stack QR Code Generator with Subscriptions

## Context

The project directory is empty — this is a greenfield build. The goal is a production-shaped SaaS: users sign up, generate static and dynamic QR codes with custom branding, track scan analytics, hit usage limits based on a subscription tier, and upgrade via Stripe. No accounts exist yet for auth/payment providers, so the app is wired against real SDKs (NextAuth, Stripe) with `.env.example` placeholders — it runs locally in a degraded-but-functional mode (email/password auth works immediately; Stripe/OAuth activate once real keys are dropped in).

## Tech stack

- **Framework**: Next.js 15 (App Router) + TypeScript, single deployable app
- **DB**: PostgreSQL via Prisma ORM. `docker-compose.yml` provides local Postgres so `docker compose up -d` + `npm run dev` works with zero cloud accounts
- **Auth**: Auth.js (NextAuth v5) — Credentials provider (bcrypt-hashed passwords) works out of the box; Google OAuth wired but inert until `GOOGLE_CLIENT_ID`/`SECRET` are set
- **Payments**: Stripe Checkout + Customer Portal + webhooks, inert until `STRIPE_SECRET_KEY` set (UI shows "billing not configured" state instead of crashing)
- **Styling/UI**: Tailwind CSS + shadcn/ui
- **QR engine**: `qr-code-styling` (dots/corner styles, embedded logo, gradient colors) rendered server-side via `node-canvas`, exported PNG/SVG/PDF (via `jspdf` wrapping the SVG) — EPS dropped, it's not realistically supportable from JS and is rarely needed vs. print-ready SVG/PDF
- **Charts**: `recharts` for the analytics dashboard
- **Rate limiting/usage**: DB-counter based (no Redis dependency required for MVP)
- **Testing**: Vitest (unit) + a Playwright smoke test for the golden path

## Data model (Prisma, high level)

- `User` — email, hashedPassword?, plan (`FREE`/`PRO`/`BUSINESS`), stripeCustomerId, stripeSubscriptionId, stripeCurrentPeriodEnd
- `QrCode` — ownerId, type (`URL`/`VCARD`/`WIFI`/`TEXT`/`EMAIL`/`SMS`/`PHONE`/`APP_LINK`/`PDF`), isDynamic, shortCode (unique, used for `/r/[shortCode]`), targetPayload (JSON — current content, editable when dynamic), design (JSON — colors/dots/logo/frame), createdAt
- `ScanEvent` — qrCodeId, timestamp, country, device, referrer (populated from request headers/geo on each `/r/[code]` hit)
- `ApiKey` — ownerId, hashedKey, label, createdAt, lastUsedAt
- `UsageCounter` — ownerId, period (YYYY-MM), dynamicQrCount, scanCount, apiCallCount — enforced against plan limits

## Feature-to-plan gating

- **Free**: limited static QR codes, 1 dynamic QR, no custom branding, no API access
- **Pro**: unlimited static + dynamic QR, custom branding/logo, bulk CSV generation, scan analytics
- **Business**: everything in Pro + REST API access with API keys + higher scan/usage ceilings

## Build phases (executed directly, no subagent scaffolding — too interdependent to parallelize safely)

1. **Scaffold**: `create-next-app` (TS, App Router, Tailwind, ESLint), shadcn/ui init, folder structure (`app/`, `lib/`, `prisma/`, `components/`), `.env.example`, `docker-compose.yml` for Postgres, README with setup steps
2. **Database**: Prisma schema above, migrations, `lib/prisma.ts` client singleton, seed script (demo user + a few QR codes)
3. **Auth**: Auth.js v5 config (`lib/auth.ts`), Credentials + Google providers, Prisma adapter, sign-up/sign-in pages, session-based route protection middleware for `/dashboard/*`
4. **QR engine + core CRUD**: `lib/qr/generate.ts` wrapping `qr-code-styling`, content-type encoders (vCard/WiFi/etc. in `lib/qr/encoders.ts`), create/edit QR form UI with live preview, PNG/SVG/PDF export
5. **Dynamic QR + analytics**: `/r/[shortCode]/route.ts` redirect handler that logs a `ScanEvent` then 302s, dashboard analytics page (scans over time, device/country breakdown via recharts)
6. **Billing**: Stripe Checkout session creation, Customer Portal link, `/api/webhooks/stripe/route.ts` handling subscription lifecycle events, plan-gating middleware/helpers (`lib/plan-limits.ts`) used across QR creation and API routes
7. **Advanced features**: bulk CSV upload → batch dynamic QR creation → zip download (`archiver`); API key management UI + hashed-key auth for `/api/v1/*` public REST endpoints (create/list/update QR, fetch analytics) with per-plan rate limits
8. **Polish**: marketing/landing page, pricing page reflecting real Stripe price IDs, account/billing settings page, empty/loading/error states
9. **Verification**: `npm run lint`, `npm run build`, `npm run test` (Vitest unit tests for QR encoders + plan-limit logic), Playwright smoke test (sign up → create dynamic QR → hit redirect → see scan in analytics), manual check via the built-in browser pane against `npm run dev`

## Verification plan

- Automated: lint + typecheck + build must pass; Vitest covers encoders and plan-limit gating logic; one Playwright e2e test covers the golden path end-to-end
- Manual: launch dev server, use the browser pane to sign up, create a static URL QR, create a dynamic QR, scan-simulate by visiting `/r/[code]`, confirm the scan shows up in analytics, walk through the Stripe Checkout flow in test mode if keys are available (otherwise confirm the "billing not configured" fallback renders cleanly)
- Document all setup steps (Postgres via Docker, Stripe test keys, Google OAuth keys) in README so the user can drop in real credentials later