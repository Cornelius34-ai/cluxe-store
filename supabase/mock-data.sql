-- supabase/mock-data.sql
-- Sample products to populate the home page.
-- Run AFTER schema.sql and seed.sql.
-- All 4 products are marked is_featured = true so they appear on the home page.

insert into public.products (
  slug, title, description, category_id, retail_price_cents, currency, stock, is_featured, is_active, rating_avg, rating_count
)
values
  -- Mens
  (
    'oversized-tee',
    'Oversized Cotton Tee',
    'Premium heavyweight cotton, relaxed fit.',
    (select id from public.categories where slug = 'mens'),
    4500, 'USD', 24, true, true, 4.6, 38
  ),
  (
    'wide-leg-trouser',
    'Wide-Leg Trouser',
    'Tailored wide-leg, soft drape.',
    (select id from public.categories where slug = 'mens'),
    9800, 'USD', 12, true, true, 4.8, 22
  ),
  -- Womens
  (
    'silk-camisole',
    'Silk Camisole',
    '100% mulberry silk, adjustable straps.',
    (select id from public.categories where slug = 'womens'),
    12500, 'USD', 8, true, true, 4.9, 15
  ),
  -- Accessories
  (
    'leather-tote',
    'Leather Tote',
    'Full-grain leather, hand-stitched.',
    (select id from public.categories where slug = 'accessories'),
    22500, 'USD', 5, true, true, 4.7, 9
  )
on conflict (slug) do nothing;
