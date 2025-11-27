-- ========================================
-- COMPLETE DATABASE SETUP FOR PHANGAN SERENITY
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Enable extensions
create extension if not exists "uuid-ossp";

-- Step 2: Create tables (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('customer', 'therapist', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  location_base text,
  bio text,
  available boolean default true,
  skills text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price_60 numeric,
  price_90 numeric,
  type text,
  category text,
  image_url text,
  staff_required integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references public.profiles(id) on delete set null,
  therapist_id uuid references public.profiles(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  scheduled_date date not null,
  scheduled_time text not null,
  duration integer check (duration in (60, 90, 120)),
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'on_way', 'arrived', 'in_progress')),
  location_text text not null,
  gps_lat numeric,
  gps_lng numeric,
  total_price numeric not null,
  notes text,
  addons text[]
);

-- Step 3: Create the trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Step 4: Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 5: Enable RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Step 6: Clear old (broken) RLS policies
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Service role can insert profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Step 7: Create RLS policies for PROFILES
-- Policy 1: Users can read their own profile
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy 2: Admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Policy 3: Service role (triggers) can insert
create policy "Service role can insert profiles"
  on public.profiles
  for insert
  with check (true);

-- Policy 4: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy 5: Admins can update any profile
create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  )
  with check (true);

-- Step 8: RLS policies for BOOKINGS
drop policy if exists "Users can read own bookings" on public.bookings;
drop policy if exists "Therapists can read their bookings" on public.bookings;
drop policy if exists "Admins can read all bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;

create policy "Users can read own bookings"
  on public.bookings
  for select
  using (
    auth.uid() = customer_id or
    auth.uid() = therapist_id or
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Users can create bookings"
  on public.bookings
  for insert
  with check (auth.uid() = customer_id);

create policy "Admins can update any booking"
  on public.bookings
  for update
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Step 9: RLS policies for SERVICES
drop policy if exists "Anyone can read services" on public.services;
create policy "Anyone can read services"
  on public.services
  for select
  using (true);

create policy "Admins can manage services"
  on public.services
  for insert
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- ✅ Database setup complete!
-- ✅ Trigger will auto-create profiles on signup
-- ✅ RLS policies protect data by role
--
-- Next: Go to Authentication → Providers → Email
--        and toggle "Confirm email" OFF for local dev
-- ========================================
