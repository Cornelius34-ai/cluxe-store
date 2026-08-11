-- supabase/schema.sql
-- cluxe Store — base schema
-- Paste this into Supabase SQL Editor (Postgres) and run once.
-- All tables use RLS; anonymous users can read public catalog data only.

-- ----------------------------------------------------------------------
-- 1. categories
-- ----------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  image_url   text,
  display_order int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select using (true);

-- ----------------------------------------------------------------------
-- 2. products
-- ----------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  retail_price_cents int not null,
  currency      text not null default 'USD',
  stock         int not null default 0,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  rating_avg    numeric(3, 2) default 0,
  rating_count  int default 0,
  created_at    timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select using (is_active = true);

-- ----------------------------------------------------------------------
-- 3. product_images
-- ----------------------------------------------------------------------
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  url           text not null,
  display_order int not null default 0,
  is_cover      boolean not null default false
);
alter table public.product_images enable row level security;

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select using (true);

-- ----------------------------------------------------------------------
-- 4. profiles (one row per auth user)
-- ----------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  display_name text,
  email       text,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
