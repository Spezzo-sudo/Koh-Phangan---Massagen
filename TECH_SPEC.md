
# 🛠️ Technical Specification

## 1. Database Schema (Supabase / PostgreSQL)

Copy and paste this SQL into the Supabase SQL Editor to set up the backend.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('customer', 'therapist', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  -- Therapist specific fields
  is_verified boolean default false,
  location_base text,
  bio text,
  available boolean default true,
  skills text[] -- Array of strings from ServiceType
);

-- 2. SERVICES (The Menu)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price_60 numeric,
  price_90 numeric,
  type text, -- ServiceType enum
  category text, -- 'Massage', 'Nails', 'Packages'
  image_url text,
  staff_required integer default 1
);

-- 3. BOOKINGS (Core Logic)
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  customer_id uuid references public.profiles(id),
  therapist_id uuid references public.profiles(id),
  service_id uuid references public.services(id),
  
  scheduled_date date not null,
  scheduled_time text not null, -- '14:00'
  duration integer check (duration in (60, 90, 120)),
  
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'on_way', 'arrived')),
  
  location_text text not null,
  gps_lat numeric,
  gps_lng numeric,
  
  total_price numeric not null,
  notes text,
  
  addons text[] -- Array of Addon IDs
);

-- 4. REALTIME
alter publication supabase_realtime add table bookings;
```

## 2. Environment Variables

Required structure for `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-key
```

## 3. Storage Strategy (Supabase Storage)

Since we need to store profile pictures for therapists and images for new services, we need a storage bucket.

1.  **Create Bucket:** Named `images` (public).
2.  **Folders:**
    *   `/avatars` (Profiles)
    *   `/services` (Menu items)
3.  **Policies:**
    *   `SELECT`: Public (anyone can view).
    *   `INSERT/UPDATE`: Authenticated Admin Only.
