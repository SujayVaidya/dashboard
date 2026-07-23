# NukeRC Dashboard

A personal start-page dashboard (shortcuts, weather, football fixtures, checklist) built with Next.js (App Router), Supabase Auth, and MongoDB.

## Stack

- **Next.js** (App Router) — frontend + API routes
- **Supabase Auth** — email + password login/signup, session managed via cookies
- **MongoDB (Mongoose)** — stores shortcuts and checklist items, scoped per user

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project's Settings > API
   - `MONGODB_URI` — a MongoDB Atlas connection string (or local `mongodb://localhost:27017/dashboard`)
2. In Supabase, enable the **Email** auth provider (Authentication > Providers). Disable "Confirm email" if you want instant sign-in during local dev.
3. Install dependencies and run:

   ```
   npm install
   npm run dev
   ```

4. Visit `http://localhost:3000` — you'll be redirected to `/login` until you sign up/log in.

## Data model

- `Shortcut` — `{ userId, name, siteUrl, iconUrl? }`
- `ChecklistItem` — `{ userId, text, done }`

Both are scoped to the authenticated user's Supabase `user.id` and exposed via:

- `GET/POST /api/shortcuts`, `PUT/DELETE /api/shortcuts/:id`
- `GET/POST /api/checklist`, `PUT/DELETE /api/checklist/:id`

Weather location preference still lives in the browser's `localStorage` (not synced across devices).
