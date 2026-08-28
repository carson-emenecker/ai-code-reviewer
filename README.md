# CodeReview AI

[![CI](https://github.com/carson-emenecker/ai-code-reviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/carson-emenecker/ai-code-reviewer/actions/workflows/ci.yml)

A SaaS web app that reviews pasted source code with Claude and returns structured findings — bugs, security issues, and improvements — each with a severity rating.

- **Live App:** https://codereviewai.app
- **Portfolio:** https://carsonemenecker.com

## What It Does

Manual code review is slow, and developers working solo often ship without a second set of eyes. CodeReview AI gives a fast first pass: paste a snippet, pick the language and scan type, and get back a categorized list of findings.

Workflow:

1. Sign up or sign in (email + password).
2. Paste code, choose a language and a scan type (Quick Scan, Full Review, or Security Audit).
3. The app sends the code to a serverless endpoint that prompts Claude for a strict JSON response.
4. Findings render as three sections — Bugs, Security Issues, Improvements — each item tagged low / medium / high / critical.
5. Free accounts have a daily review quota; a Pro subscription (via Stripe) removes the quota and unlocks the Security Audit scan type.

## Features

- Structured AI code review with severity-rated findings
- Three scan modes: Quick Scan, Full Review, Security Audit (Pro)
- Supported languages: JavaScript, TypeScript, Python, C, C++, Java, Go, Rust
- Email/password authentication via Supabase Auth
- Free-tier daily quota and Pro-only scan gating enforced server-side against the verified user identity
- Stripe Checkout for subscriptions, with signature-verified webhooks that sync subscription status to the database
- Self-serve cancellation (cancels at period end) from the Account page
- Per-IP rate limiting on the review endpoint as defense in depth
- Vercel Analytics

## Architecture

```
Browser (React 19 + Vite SPA, React Router)
   │
   ├── Supabase JS client (anon key)
   │     ├── Auth: sign up / sign in / session (issues the access token)
   │     └── Read-only: usage_tracking (daily counts), subscriptions (status) for UI state
   │
   └── Vercel Serverless Functions (api/*.js, Node.js)
         ├── POST /api/review  (Authorization: Bearer <Supabase access token>)
         │     → verifies token with Supabase → loads plan + today's usage (service role)
         │     → enforces quota / Pro gating → Anthropic Claude (Haiku 4.5) → JSON findings
         │     → records usage
         ├── POST /api/create-checkout      → Stripe Checkout Session (subscription mode)
         ├── POST /api/cancel-subscription  → Stripe (cancel_at_period_end) via Supabase lookup
         └── POST /api/webhook              → Stripe webhook (signature verified)
                                               → upserts subscriptions in Supabase (service role)
```

Key points:

- The Anthropic API key, Stripe secret key, webhook secret, and Supabase service-role key live only in the serverless functions; the browser never sees them.
- `/api/review` derives the user from a verified Supabase access token (never from a client-supplied ID) and applies plan and quota rules server-side. The UI reads the same data only to show state (remaining reviews, Pro badge); it cannot grant access.
- `vercel.json` rewrites all non-`/api` routes to `index.html` for client-side routing.
- The webhook handler disables Vercel's body parser and reads the raw request body so Stripe's signature can be verified.
- Subscription state is written only by the Stripe webhook; usage counts are written only by `/api/review`. Both use the service-role key server-side.

## Tech Stack

Versions are from `package.json` / `package-lock.json`.

| Layer | Technology |
|---|---|
| Frontend | React 19.2, React Router 7, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`) |
| Backend | Vercel Serverless Functions (Node.js), `@anthropic-ai/sdk` 0.106, `stripe` 22 |
| Auth & data | Supabase (`@supabase/supabase-js` 2.108) — Auth + Postgres tables |
| Billing | Stripe Checkout + Webhooks |
| AI model | Anthropic Claude Haiku 4.5 |
| Tooling | oxlint, Vercel Analytics, npm |
| Hosting | Vercel |

Runtime: Node.js 20.19+ or 22.12+ (required by Vite 8); CI uses Node 22.

## Local Development

```bash
git clone https://github.com/carson-emenecker/ai-code-reviewer.git
cd ai-code-reviewer
npm install
cp .env.example .env.local   # then fill in your own keys
npm run dev                  # Vite dev server at http://localhost:5173
```

Notes:

- `npm run dev` serves the React app only. The `api/*.js` functions are Vercel Serverless Functions; to run them locally use the Vercel CLI (`npm i -g vercel`, then `vercel dev`), which serves both the app and the API and reads `.env.local`.
- You need your own Supabase project (with `usage_tracking` and `subscriptions` tables), a Stripe account with a recurring Price, and an Anthropic API key. Stripe webhooks can be forwarded locally with `stripe listen --forward-to localhost:3000/api/webhook`.

## Environment Variables

Names only — see `.env.example`. Never commit real values.

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public anon key |
| `ANTHROPIC_API_KEY` | `api/review.js` | Claude API access |
| `SUPABASE_URL` | `api/review.js`, `api/webhook.js`, `api/cancel-subscription.js` | Supabase project URL (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/review.js`, `api/webhook.js`, `api/cancel-subscription.js` | Token verification and privileged DB access (server only) |
| `STRIPE_SECRET_KEY` | `api/*` | Stripe server SDK |
| `STRIPE_WEBHOOK_SECRET` | `api/webhook.js` | Webhook signature verification |
| `STRIPE_PRICE_ID` | `api/create-checkout.js` | Recurring Price for the Pro plan |

Only `VITE_`-prefixed variables are exposed to the browser.

## Quality Checks

```bash
npm run lint    # oxlint (React hooks rules enabled)
npm run build   # Vite production build
```

There is no automated test suite yet. CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, and `npm run build` on every push and pull request.

## Development Approach

This application was built with AI-assisted development tooling (Claude) used throughout for generating and refactoring code. Product requirements, architecture and vendor choices (Supabase, Stripe, Vercel, Anthropic), integration of the third-party services, debugging, manual validation of the end-to-end flows (auth, review, checkout, webhooks, cancellation), and deployment to production were directed and reviewed by me. AI output was treated as a draft to be read, verified, and adjusted rather than accepted as-is.

## Status and Limitations

This is a working, deployed side project — not an enterprise product. Known limitations:

- **AI output is not guaranteed correct.** Reviews can miss real issues and report false positives. It is a first-pass aid, not a substitute for human review or a professional security audit.
- **Quota accounting is best-effort under concurrency.** The daily counter is a read-then-upsert rather than an atomic database increment, so simultaneous requests from one user could be counted imprecisely. A Postgres function or row-level increment would tighten this.
- **IP rate limiting is per-instance and in-memory.** It resets on cold starts and is not shared across serverless instances; it is a secondary control behind the per-user quota, not the primary one.
- **No review history.** Results are not persisted; each review is stateless.
- **Snippet-level only.** The app reviews a single pasted snippet, not a repository or multi-file context.
- **No automated tests.** Quality is currently checked via linting, the production build, and manual testing.
- **Limited Stripe lifecycle handling.** The webhook handles `checkout.session.completed` and `customer.subscription.deleted`; payment failures and plan changes are not handled.
