## Summary

<!-- What changed and why. Link the issue if there is one. -->

## Area

<!-- Delete lines that do not apply. -->

- [ ] `src/pages` or `src/components` (landing, auth, dashboard, league, match thread, account, support)
- [ ] Auth or subscription context
- [ ] Supabase client or generated types (`src/integrations/supabase`)
- [ ] Edge Function (`supabase/functions`: data sync, insights, Stripe, contact email)
- [ ] Migration or `supabase/config.toml` schedule
- [ ] Docs or GitHub config only

## How to verify

- [ ] `npm run lint` (ESLint 9; CI runs this on Node.js 22)
- [ ] `npm run typecheck` (`tsc --noEmit` for the app and `vite.config.ts`; CI runs this after lint)
- [ ] `npm run build` (Vite production build; CI runs this after typecheck)
- [ ] Checked in the browser on `http://localhost:8080` if the UI or a route changed
- [ ] Signed-out routes (`/`, `/start`, `/auth`) still behave as before if those pages were touched
- [ ] Paywalled match content and the pricing modal still match the subscription state if billing or match threads changed

## Notes for reviewers

<!-- Migrations to apply, Edge Function secrets (names only: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`, `RAPIDAPI_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), cron changes, or screenshots. Do not commit `.env` or secret values. -->
