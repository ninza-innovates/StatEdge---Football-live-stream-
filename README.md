# StatEdge.ai

StatEdge.ai is a web app for AI-assisted football match insights. Visitors can browse a public landing page, create an account, and, once signed in, open a dashboard of today's fixtures, league pages, saved favourites, and per-match threads. Match threads show stored AI analysis — summary, stats, tactics, lineups and injuries, and betting angles — generated from API-Football data. Weekly and monthly access is sold through Stripe.

This repository was bootstrapped with [Lovable](https://lovable.dev/projects/943dc745-aad8-44f1-8522-724e584cd877).

## Stack

- [Vite](https://vitejs.dev/) 5 with `@vitejs/plugin-react-swc`, React 18, and TypeScript
- React Router 7
- Tailwind CSS, `tailwindcss-animate`, and `@tailwindcss/typography`
- shadcn/ui on Radix UI (dialog, label, select, separator, slot, tabs, toast, tooltip)
- Supabase (`@supabase/supabase-js`) for auth, Postgres, and Edge Functions (Deno)
- Stripe (checkout, Customer Portal, webhooks) in Edge Functions
- OpenAI Chat Completions (`gpt-4o`) for match insights
- API-Football for fixtures, standings, squads, and player stats
- Resend for the support contact form
- Zod, Luxon, Lucide, and `react-helmet`
- ESLint 9

The dev server listens on port **8080** (`vite.config.ts`). In development, Vite also loads `lovable-tagger`.

## Setup

Node.js 22 and npm are required. Copy the environment template, then install and start the dev server. The filled `.env` stays on your machine:

```sh
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:8080`.

`.env.example` documents the environment names for this app:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` are the browser project values. The client in `src/integrations/supabase/client.ts` does not import them; the URL and anon key are written in that file.
- Edge Functions read `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`, `RAPIDAPI_KEY`, and `RESEND_API_KEY` with `Deno.env.get`. Set those in the Supabase project. See [Edge Function secrets](#edge-function-secrets).

Apply `supabase/migrations` before the app can load leagues, fixtures, and subscriptions. Function schedules are in `supabase/config.toml`.

## Scripts

From `package.json`:

```sh
npm run dev          # start the Vite dev server on port 8080
npm run build        # production build
npm run build:dev    # vite build --mode development
npm run preview      # serve the production build
npm run lint         # eslint .
npm run typecheck    # tsc --noEmit for the app and vite.config.ts
npm test             # node:test for shared helpers
```

## Key features

- **Landing page** (`/`) with a short product explanation, league logos, pricing, and the next three not-started fixtures. Viewing a fixture from this page sends the visitor to sign-in.
- **Signup landing** (`/start`) that lists upcoming fixtures and links to account creation.
- **Email and password auth** through Supabase. Sign-in and sign-up live at `/auth`. Successful auth goes to the dashboard.
- **Dashboard** of today's fixtures in the user's timezone, grouped by league. Users can show only favourited fixtures. Up to three "featured" cards are picked with standings heuristics (top-six clashes, large rank gaps, combined recent form, and high goals-per-game).
- **League pages** (`/league/:slug`) with fixtures (search, date window, list or grid), the league table, recent form, and top scorers. Users with an `admin` role see a button that calls the initial data-sync function.
- **Favourites** stored per user and listed at `/favourites`.
- **Match threads** (`/match/:slug`) with team comparison, AI quick and advanced summaries, key stats, tactical analysis, advanced insights, predicted lineups and injuries, and betting angles. If no summary exists yet, the page says analysis is available 24 hours before kick-off. Users without an active subscription get the pricing modal.
- **Account** page with profile, plan (free or the stored Stripe tier), a Stripe Customer Portal or checkout link, and usage counts (AI insights used and limit, favourites, matches viewed).
- **Support** page with an FAQ and a contact form. Submissions are emailed with Resend to `support@statedge.ai`.
- **Subscriptions.** The pricing UI offers a Weekly Pass at $4.99 / 7 days and a Monthly Plan at $14.99 / month. Checkout, the billing portal, and subscription state are handled by Supabase Edge Functions and a Stripe webhook that writes the `subscribers` table.
- **Data sync.** `sync-football-data` pulls fixtures, teams, standings, and top scorers from API-Football for league ids `2, 3, 39, 40, 41, 61, 78, 88, 94, 135, 140, 253` (Champions League, Europa League, Premier League, Championship, EFL League One, Ligue 1, Bundesliga, Eredivisie, Primeira Liga, Serie A, La Liga, and MLS) and archives finished fixtures. It is scheduled every 12 hours. `generate-match-insights` asks OpenAI (`gpt-4o`) for match JSON and is scheduled at minute 5 of every 12th hour. `initial-data-sync` loads Premier League standings, top scorers, and upcoming fixtures.

Routes other than `/`, `/start`, and `/auth` require a signed-in user.

## Edge Function secrets

Edge Functions read these secrets (`Deno.env.get`). Set them in the Supabase project, not in the Vite app. Use your own values:

```sh
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
OPENAI_API_KEY=sk-your-openai-key
RAPIDAPI_KEY=your-rapidapi-key
RESEND_API_KEY=re_your_key
```

`initial-data-sync`, `test-api-connection`, `sync-football-data`, and `generate-match-insights` read `RAPIDAPI_KEY`. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used by the data, Stripe, and insight functions. `STRIPE_SECRET_KEY` is used by checkout, portal, and the webhook. `STRIPE_WEBHOOK_SECRET` is used by `stripe-webhook`. `OPENAI_API_KEY` is used by `generate-match-insights`. `RESEND_API_KEY` is used by `send-contact-email`.

## Project structure

```
src/
  pages/                  route screens (landing, auth, dashboard, league, match, account, support)
  components/             landing, pricing, sidebar, and shared UI
  components/matchthread/ match-thread sections
  components/ui/          shadcn/ui primitives
  contexts/               auth and subscription state
  hooks/
  integrations/supabase/  browser client and generated table types
  utils/                  fixture URL slugs and featured-insight scoring
  assets/                 logo and league artwork
public/                   favicon and uploaded images
supabase/
  config.toml             project id and function JWT/cron settings
  functions/              data sync, AI insights, Stripe, and contact email
  migrations/             Postgres schema and seed data
```

App routes are declared in `src/App.tsx`.
