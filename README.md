# software-engineer-life — Interview Prep App

Next.js (App Router) + Supabase port of the InterviewPrepApp design. Tracks coding practice
confidence and notes per LeetCode problem, a knowledge base across 8 tracks, per-user auth,
an admin content editor, and an optional AI coach powered by the Anthropic API.

## Stack

- Next.js 15 (App Router, Server Components, Server Actions) — deploys free on Vercel
- Supabase — Postgres, auth (email/password), row-level security — free tier
- Anthropic API — AI coaching tips in the coding drawer (optional)

## 1. Supabase setup (free)

1. Create a project at https://supabase.com (free tier).
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.
   This creates the tables, row-level security policies, and seed content from the design.
3. Go to **Project Settings → API** and copy the Project URL and `anon` public key.
4. (Optional, for local testing) **Authentication → Sign In / Up → Email**: disable
   "Confirm email" so signups work instantly without an SMTP setup.

## 2. Local development

```bash
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```

Open http://localhost:3000, create an account, then make yourself admin
(SQL Editor):

```sql
update public.profiles set role = 'admin'
  where id = (select id from auth.users where email = 'you@example.com');
```

The Admin tab appears after you refresh.

## 3. AI coach (optional)

Set `ANTHROPIC_API_KEY` in `.env.local` (and later in Vercel). Get a key at
https://console.anthropic.com. The route `app/api/ai/coach/route.ts` uses
`claude-haiku-4-5` — pay-per-use, typically well under a cent per request.
Without the key the app still works; the coach button shows a friendly message.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → **Add New → Project** → import the repo
   (framework auto-detects as Next.js; no config needed).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional)
4. Deploy. Done — Vercel's Hobby plan has no cold-start problem for this app.

Everything runs on Vercel + Supabase free tiers; the only possible cost is
Anthropic API usage if you enable the AI coach.

## Project layout

```
app/
  login/               login screen (email/password, sign up)
  (app)/               authenticated shell (nav + guard)
    page.tsx           dashboard (readiness ring, track bars, recent questions)
    coding/            LeetCode tracker (confidence, notes, AI coach drawer)
    knowledge/         knowledge base grid + /knowledge/[id] doc view
    admin/             content editor (admins only)
    profile/           profile, confidence breakdown, sign out
  api/ai/coach/        Anthropic-backed coaching route
components/            shared UI (Nav, badges, dots, chips)
lib/                   Supabase clients, data helpers, types, sections
supabase/schema.sql    tables + RLS + seed data
```

## Notes

- Content (questions/docs) is global and editable by admins; confidence + notes
  are per-user (`question_state` with RLS).
- The original design's "Continue with Keycloak" SSO was adapted to Supabase
  email/password auth. Keycloak/OIDC can be added later via Supabase's SSO options.
