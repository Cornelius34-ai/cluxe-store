-- ============================================
-- STEP 1: DIAGNOSE — what's actually in the DB?
-- ============================================
select
  id,
  email,
  email_confirmed_at is not null as confirmed,
  encrypted_password is not null as has_password,
  case
    when encrypted_password is null then 'no hash'
    when encrypted_password like '$2a$%' then 'bcrypt $2a$ (correct)'
    when encrypted_password like '$2b$%' then 'bcrypt $2b$ (correct)'
    when encrypted_password like '$2y$%' then 'bcrypt $2y$ (should work)'
    else 'unexpected format'
  end as hash_format,
  length(encrypted_password) as hash_length,
  created_at,
  updated_at
from auth.users
where email = 'kingneliusmuso@gmail.com';

-- ============================================
-- STEP 2: RESET PASSWORD — gen_salt lives in `extensions`
-- ============================================
update auth.users
set
  encrypted_password = extensions.crypt('12345678', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where email = 'kingneliusmuso@gmail.com';

-- ============================================
-- STEP 3: VERIFY
-- ============================================
select
  email,
  email_confirmed_at is not null as confirmed,
  encrypted_password like '$2a$%' as is_bcrypt_a,
  length(encrypted_password) as hash_length
from auth.users
where email = 'kingneliusmuso@gmail.com';
