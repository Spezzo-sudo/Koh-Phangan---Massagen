-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
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
  skills text[]
);

-- 2. SERVICES (The Menu)
create table if not exists public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price_60 numeric,
  price_90 numeric,
  type text,
  category text,
  image_url text,
  staff_required integer default 1
);

-- 3. BOOKINGS (Core Logic)
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references public.profiles(id),
  therapist_id uuid references public.profiles(id),
  service_id uuid references public.services(id),
  scheduled_date date not null,
  scheduled_time text not null,
  duration integer check (duration in (60, 90, 120)),
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'on_way', 'arrived')),
  location_text text not null,
  gps_lat numeric,
  gps_lng numeric,
  total_price numeric not null,
  notes text,
  addons text[]
);

-- =====================================================
-- AUTO-CREATE PROFILE WHEN USER REGISTERS
-- =====================================================
-- This trigger automatically creates a profile entry when a new user signs up
-- The profile is created with role='customer' by default (can be updated by admin)

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

-- Drop the trigger if it exists (to allow re-running this script)
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger that fires when a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
