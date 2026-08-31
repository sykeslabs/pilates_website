# Studio Pilates website

A course-overview and booking site: browse course types and success stories,
and book an open time slot directly. Availability is managed by the studio
owner from a simple `/admin` dashboard — no code changes needed for day-to-day
scheduling. Online payment is not wired up yet (see "What's next" below).

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS**, with
**Supabase** (Postgres + Auth + Storage) as the backend. No separate server —
everything runs as one app on Vercel.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free account and a new project.
2. In the project, open **SQL Editor** and run, in order:
   - the contents of `supabase/migrations/0001_init.sql`
   - the contents of `supabase/migrations/0002_i18n.sql` (adds German/French
     content columns — only needed once; a brand-new project can run this
     right after `0001_init.sql`, before seeding)
   - the contents of `supabase/seed.sql` (placeholder courses, success stories, and a
     few weeks of sample availability, so the site isn't empty on first run)
3. Create the studio owner's login: **Authentication -> Users -> Add user**,
   enter her email and a password (untick "auto confirm" only if you want her
   to verify by email first). This is the only account the site needs — there
   is no public sign-up.
4. Copy three values from **Project Settings -> API**:
   - Project URL
   - `anon` `public` key

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the
values from step 1. These are safe to expose to the browser — the database
itself is protected by Row Level Security (see the migration file for exactly
what public visitors vs. the logged-in admin can do).

## 3. (Optional) Email confirmations

Booking works fine without this — it's purely additive. When configured, each
booking sends a confirmation email to the participant and a notification
email to the studio owner.

1. Create a free account at [resend.com](https://resend.com) and grab an API key.
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_...
   STUDIO_OWNER_EMAIL=her-email@example.com
   ```
3. **Sandbox limitation**: until you verify your own sending domain in Resend,
   you can only send from `onboarding@resend.dev`, and only *to the email
   address you signed up to Resend with*. That's enough to test the flow
   end-to-end, but real participants won't receive emails yet. To go live:
   in Resend, verify a domain you control (add the DNS records they give
   you), then set `BOOKING_EMAIL_FROM=Studio Pilates <bookings@yourdomain.com>`.

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Log in at `/admin` with the account you
created in step 1 to manage courses, availability, and bookings.

## 5. Deploy

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import the repo into [Vercel](https://vercel.com) — default Next.js
   settings work with no changes.
3. In the Vercel project's **Settings -> Environment Variables**, add the same
   variables from steps 2-3.
4. Deploy. Every push to `main` will redeploy automatically.

## How booking works

- A visitor picks a course, then an open time slot, then enters their name,
  email and phone.
- Booking a slot calls a Postgres function (`book_slot`) that checks capacity
  and creates the booking in a single transaction — this is what prevents two
  people from double-booking the last open spot.
- The admin dashboard (`/admin/dashboard`) manages course types (with photo
  upload), opens/hides availability slots (including "repeat weekly"), and
  lists/cancels bookings.

## Languages

The home page, `/book`, and the `/admin` login screen are available in
English, German and French (selector in the header). The admin *dashboard*
itself stays English-only, but its Course/Success story forms have separate
German and French fields — leaving those blank just falls back to the
English text on the public site, so translating is optional, not required.

## What's next (not built yet)

- **Online payment** — Stripe is the natural fit. The `bookings` table
  already has a `payment_status` column so this can be added without
  reshaping the schema: on `book_slot`, create a Stripe Checkout session
  instead of confirming immediately, then confirm the booking from a Stripe
  webhook once payment succeeds.
- **SMS confirmations** — booking confirmation and cancellation emails are
  in (see step 3 above); an SMS channel would follow the same pattern in
  `lib/email.ts`.
- **Real content** — course photos/descriptions and success stories are
  currently placeholders. Replace them from `/admin/dashboard` (courses,
  success stories) — no code changes needed.
