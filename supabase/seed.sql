-- supabase/seed.sql
-- Insert one sample category so the UI has something to render.
-- Run AFTER schema.sql.

insert into public.categories (slug, name, display_order)
values
  ('mens', 'Mens', 1),
  ('womens', 'Womens', 2),
  ('accessories', 'Accessories', 3)
on conflict (slug) do nothing;
