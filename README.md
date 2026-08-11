# cluxe

A modern clothing storefront. Built with Next.js 16, Tailwind v4, Supabase, and Zustand. Deployed on Vercel.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`)
- **Database:** Supabase (Postgres + RLS + magic-link auth)
- **Cart:** Zustand (persisted in localStorage)
- **Icons:** lucide-react
- **Deploy:** Vercel

## Status

Empty storefront scaffold. No mock data. Pages render gracefully when Supabase is unset.

## Quick start

```bash
# 1. install dependencies
npm install

# 2. copy env file and fill in your Supabase credentials
cp .env.example .env.local

# 3. run the dev server
npm run dev
```

The site runs on `http://localhost:3000` even without Supabase configured. Every page shows a "wire up Supabase to populate" hint instead of crashing.

## Wire up Supabase

1. Create a project at https://supabase.com
2. Copy the **Project URL** and **anon key** → paste into `.env.local`
3. Open **SQL Editor** in the Supabase dashboard
4. Paste `supabase/schema.sql` → click **Run**
5. (Optional) Paste `supabase/seed.sql` to insert 3 sample categories
6. Restart `npm run dev`

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Header, Footer, CartDrawer)
│   ├── page.tsx                # Home (empty state)
│   ├── categories/page.tsx     # All categories
│   ├── category/[slug]/page.tsx
│   ├── product/[slug]/page.tsx
│   ├── search/page.tsx
│   └── cart/page.tsx
├── components/
│   ├── Header.tsx              # logo + nav + cart icon
│   ├── Footer.tsx
│   └── CartDrawer.tsx          # client-side cart preview
├── lib/
│   ├── cart-store.ts           # Zustand cart state
│   └── supabase/
│       ├── client.ts           # browser client
│       ├── server.ts           # server client (async, uses cookies)
│       └── queries.ts          # typed data fetchers
├── types/
│   └── (add DB types here)
proxy.ts                        # Next.js 16 proxy (not middleware)
supabase/
├── schema.sql                  # base schema
└── seed.sql                    # sample categories
```

## Next steps (build one at a time)

1. [ ] Add `types/database.ts` matching schema.sql
2. [ ] Fill in `src/lib/supabase/queries.ts` with typed fetchers
3. [ ] Wire pages to live data (home → featured, /categories → categories list)
4. [ ] Add product detail page (description, images, add to cart)
5. [ ] Add Stripe checkout
6. [ ] Add auth (login/signup with Supabase magic link)
7. [ ] Deploy to Vercel

## Deploy

```bash
# Push to GitHub first, then:
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

## License

Private — Cornelius34-ai.
