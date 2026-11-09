---
name: Bug report
about: Something broken in StatEdge.ai (the Vite app, a route, billing, or an Edge Function)
title: "[Bug] "
labels: bug
assignees: ""
---

## What broke

<!-- One or two sentences. Name the screen or function if you can. -->

## Where

- Route or page: <!-- /, /start, /auth, dashboard, /league/:slug, /favourites, /match/:slug, account, support, or an Edge Function -->
- Signed in: <!-- yes / no / not sure -->
- Plan: <!-- free, Weekly Pass ($4.99 / 7 days), Monthly Plan ($14.99 / month), or n/a -->
- League or fixture: <!-- slug, league name, or kick-off time if this is fixture-specific -->
- Browser and timezone: <!-- dashboard fixtures are grouped in the user's timezone -->

## Steps to reproduce

1.
2.
3.

## Expected

<!-- What should have happened. -->

## Actual

<!-- What happened instead. Include the on-screen message, for example "analysis is available 24 hours before kick-off" or the pricing modal, if that is what you saw. -->

## Extra detail

<!-- Screenshots, browser console errors, or the failing request name. Do not paste Supabase keys, Stripe secrets, OpenAI keys, RapidAPI keys, Resend keys, or `.env` contents. -->

- App: local `npm run dev` on port 8080, or the deployed site
- Relevant area if known: landing, auth (Supabase), fixtures and standings (API-Football), match insights (OpenAI), Stripe checkout or Customer Portal, support form (Resend), or `supabase/functions` (`sync-football-data`, `generate-match-insights`, `initial-data-sync`, `create-stripe-checkout`, `create-stripe-portal`, `stripe-webhook`, `send-contact-email`)
